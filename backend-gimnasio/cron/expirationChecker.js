const cron = require('node-cron');
const { sql, poolPromise } = require('../config/db');
const emailService = require('../services/emailService');

const startCronJobs = () => {
    // Check every day at 00:00 (midnight)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily expiration check...');
        try {
            const pool = await poolPromise;
            
            // Get all active subscriptions that end in exactly 3 days
            // (Where CAST(EndDate AS DATE) = CAST(DATEADD(day, 3, GETDATE()) AS DATE))
            const result = await pool.request().query(`
                SELECT s.SubscriptionID, s.UserID, s.EndDate, u.FirstName, u.LastName, u.Email
                FROM Subscriptions s
                JOIN Users u ON s.UserID = u.UserID
                WHERE s.PaymentStatus = 'Paid'
                  AND CAST(s.EndDate AS DATE) = CAST(DATEADD(day, 3, GETDATE()) AS DATE)
            `);

            const subscriptions = result.recordset;
            let notificationsCreated = 0;

            for (const sub of subscriptions) {
                const message = `Tu membresía vence en 3 días (el ${new Date(sub.EndDate).toLocaleDateString()}). ¡Renueva pronto!`;

                const checkNotif = await pool.request()
                    .input('UserID', sql.Int, sub.UserID)
                    .input('Message', sql.NVarChar, message)
                    .query('SELECT NotificationID FROM Notifications WHERE UserID = @UserID AND Message = @Message');

                if (checkNotif.recordset.length === 0) {
                    await pool.request()
                        .input('UserID', sql.Int, sub.UserID)
                        .input('Title', sql.NVarChar, 'Aviso de Vencimiento')
                        .input('Message', sql.NVarChar, message)
                        .input('Type', sql.NVarChar, 'Vencimiento')
                        .query('INSERT INTO Notifications (UserID, Title, Message, Type) VALUES (@UserID, @Title, @Message, @Type)');
                    notificationsCreated++;

                    // Disparar correo con la nueva utilidad EmailService
                    await emailService.sendEmailAndLog(
                        sub.UserID,
                        sub.Email,
                        'Aviso de Vencimiento de Membresía',
                        `<p>Hola ${sub.FirstName || ''}, ${message}</p>`,
                        'Vencimiento'
                    );
                }
            }

            console.log(`Expiration check finished. ${notificationsCreated} new notifications & emails created.`);
        } catch (error) {
            console.error('Error during expiration check cron job:', error);
        }
    });

    console.log('Cron jobs initialized: Daily expiration check scheduled.');
};

module.exports = { startCronJobs };
