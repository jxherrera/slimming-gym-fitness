const { poolPromise, sql } = require('./config/db');
const emailService = require('./services/emailService');

async function testApprove() {
  const paymentId = 5;
  const userId = 1; // Admin ID
  try {
    const pool = await poolPromise;
    const detailResult = await pool.request()
      .input('PaymentID', sql.Int, paymentId)
      .query(`
        SELECT p.SubscriptionID, pl.DurationDays, u.Email, u.UserID as targetUserId
        FROM Payments p
        INNER JOIN Subscriptions s ON p.SubscriptionID = s.SubscriptionID
        INNER JOIN Plans pl ON s.PlanID = pl.PlanID
        INNER JOIN Users u ON s.UserID = u.UserID
        WHERE p.PaymentID = @PaymentID
      `);

    if (detailResult.recordset.length === 0) {
      console.log('No payment details found');
      return;
    }

    const { SubscriptionID, DurationDays, Email, targetUserId } = detailResult.recordset[0];
    console.log('Details:', SubscriptionID, DurationDays, Email, targetUserId);

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      await transaction.request()
        .input('PaymentID', sql.Int, paymentId)
        .input('LastModifiedBy', sql.Int, userId)
        .query("UPDATE Payments SET Status = 'A', LastModifiedBy = @LastModifiedBy WHERE PaymentID = @PaymentID");

      console.log('Payment updated');

      await transaction.request()
        .input('SubscriptionID', sql.Int, SubscriptionID)
        .input('DurationDays', sql.Int, DurationDays)
        .query(`
          UPDATE Subscriptions 
          SET PaymentStatus = 'P',
              StartDate = CAST(GETDATE() AS DATE),
              EndDate = CAST(DATEADD(day, @DurationDays, GETDATE()) AS DATE)
          WHERE SubscriptionID = @SubscriptionID
        `);
      
      console.log('Subscription updated');

      await transaction.commit();
      console.log('Committed');

      console.log('Sending email...');
      await emailService.sendEmailAndLog(
        targetUserId,
        Email,
        'Pago Aprobado - Slimming Gym',
        '<p>Hola, tu comprobante de pago ha sido aprobado exitosamente. Ya puedes disfrutar de tu plan.</p>',
        'Pago'
      );
      console.log('Done!');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('ERROR EN CATCH:', err.message);
  }
  process.exit();
}

testApprove();
