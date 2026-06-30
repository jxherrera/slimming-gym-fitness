const cron = require('node-cron');
const { sql, poolPromise } = require('../config/db');

const startCronJobs = () => {
    // Check every day at 00:00 (midnight)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily expiration check...');
        try {
            const pool = await poolPromise;
            
            // Get all active subscriptions that end within 5 days
            // and where we haven't already sent a notification for this specific expiration
            const result = await pool.request().query(`
                SELECT s.SubscriptionID, s.UserID, s.EndDate, u.Name
                FROM Subscriptions s
                JOIN Users u ON s.UserID = u.UserID
                WHERE s.PaymentStatus = 'Paid'
                  AND s.EndDate > GETDATE()
                  AND s.EndDate <= DATEADD(day, 5, GETDATE())
            `);

            const subscriptions = result.recordset;
            let notificationsCreated = 0;

            for (const sub of subscriptions) {
                const daysLeft = Math.ceil((new Date(sub.EndDate) - new Date()) / (1000 * 60 * 60 * 24));
                const message = `Tu membresía vence en ${daysLeft} día(s) (el ${new Date(sub.EndDate).toLocaleDateString()}). ¡Renueva pronto!`;

                // Check if we already notified them today or recently to avoid spamming every day
                // For simplicity, we just insert. A more robust way is checking if a similar unread message exists.
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
                }
            }

            console.log(`Expiration check finished. ${notificationsCreated} new notifications created.`);
        } catch (error) {
            console.error('Error during expiration check cron job:', error);
        }
    });

    console.log('Cron jobs initialized: Daily expiration check scheduled.');
};

module.exports = { startCronJobs };
