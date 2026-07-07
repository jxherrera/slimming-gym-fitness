const { poolPromise, sql } = require('../config/db');
const { bucket } = require('../config/gcs');
const emailService = require('../services/emailService');

exports.getPendingPayments = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        p.PaymentID as paymentId,
        p.SubscriptionID as subscriptionId,
        p.AmountPaid as amountPaid,
        p.PaymentDate as paymentDate,
        p.PaymentMethod as paymentMethod,
        p.ReferenceNumber as referenceNumber,
        p.ReceiptImageUrl as receiptImageUrl,
        p.Status as paymentStatus,
        u.UserID as userId,
        (u.FirstName + ' ' + u.LastName) as memberName,
        u.Email as memberEmail,
        pl.PlanName as planName,
        pl.DurationDays as durationDays
      FROM Payments p
      INNER JOIN Subscriptions s ON p.SubscriptionID = s.SubscriptionID
      INNER JOIN Users u ON s.UserID = u.UserID
      INNER JOIN Plans pl ON s.PlanID = pl.PlanID
      WHERE p.Status = 'P'
      ORDER BY p.PaymentDate DESC
    `);

    res.json({
      success: true,
      payments: result.recordset
    });
  } catch (error) {
    console.error('Error al obtener pagos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al obtener los pagos pendientes.',
      error: error.message
    });
  }
};

exports.approvePayment = async (req, res) => {
  const paymentId = Number(req.params.id);
  const { userId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ success: false, message: 'ID de pago no válido.' });
  }

  if (!userId) {
    return res.status(400).json({ success: false, message: 'El ID del administrador (userId) es requerido para auditoría.' });
  }

  try {
    const pool = await poolPromise;
    const detailResult = await pool.request()
      .input('PaymentID', sql.Int, paymentId)
      .query(`
        SELECT p.SubscriptionID, p.ReceiptImageUrl, pl.DurationDays, u.Email, u.FirstName, u.UserID as targetUserId
        FROM Payments p
        INNER JOIN Subscriptions s ON p.SubscriptionID = s.SubscriptionID
        INNER JOIN Plans pl ON s.PlanID = pl.PlanID
        INNER JOIN Users u ON s.UserID = u.UserID
        WHERE p.PaymentID = @PaymentID
      `);

    if (detailResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron los detalles de la suscripción vinculada a este pago.' });
    }

    const { SubscriptionID, ReceiptImageUrl, DurationDays, Email, FirstName, targetUserId } = detailResult.recordset[0];

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      await transaction.request()
        .input('PaymentID', sql.Int, paymentId)
        .input('LastModifiedBy', sql.Int, userId)
        .query("UPDATE Payments SET Status = 'A', LastModifiedBy = @LastModifiedBy WHERE PaymentID = @PaymentID");

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

      await transaction.commit();

      await emailService.sendPaymentApprovedEmail(targetUserId, Email, FirstName, false, ReceiptImageUrl);

      res.json({ success: true, message: 'Pago aprobado y suscripción activada correctamente.' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Error al aprobar el pago:', error);
    res.status(500).json({ success: false, message: 'Error interno al aprobar el pago.', error: error.message });
  }
};

exports.rejectPayment = async (req, res) => {
  const paymentId = Number(req.params.id);
  const { userId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ success: false, message: 'ID de pago no válido.' });
  }

  if (!userId) {
    return res.status(400).json({ success: false, message: 'El ID del administrador (userId) es requerido para auditoría.' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('PaymentID', sql.Int, paymentId)
      .input('LastModifiedBy', sql.Int, userId)
      .query("UPDATE Payments SET Status = 'R', LastModifiedBy = @LastModifiedBy WHERE PaymentID = @PaymentID");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado.' });
    }

    res.json({ success: true, message: 'Pago rechazado correctamente.' });
  } catch (error) {
    console.error('Error al rechazar el pago:', error);
    res.status(500).json({ success: false, message: 'Error interno al rechazar el pago.', error: error.message });
  }
};

exports.uploadPayment = async (req, res) => {
  const { userId, planId, paymentMethod, referenceNumber } = req.body;

  if (!userId || !planId || !paymentMethod || !referenceNumber) {
    return res.status(400).json({ success: false, message: 'Todos los campos son requeridos (userId, planId, paymentMethod, referenceNumber).' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se proporcionó la imagen del comprobante.' });
  }

  try {
    const pool = await poolPromise;

    const planResult = await pool.request()
      .input('PlanID', sql.Int, planId)
      .query('SELECT Price FROM Plans WHERE PlanID = @PlanID');

    if (planResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'El plan seleccionado no existe.' });
    }

    const amountPaid = planResult.recordset[0].Price;

    let safeOriginalName = req.file.originalname || 'comprobante.jpg';
    safeOriginalName = safeOriginalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    if (safeOriginalName.startsWith('.')) {
      safeOriginalName = 'comprobante' + safeOriginalName;
    }

    const blob = bucket.file(`receipts/${Date.now()}_${safeOriginalName}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      validation: false,
      contentType: req.file.mimetype || 'image/jpeg',
    });

    blobStream.on('error', (err) => {
      console.error('Error al subir a GCS:', err);
      return res.status(500).json({ success: false, message: 'Error subiendo el archivo a la nube.' });
    });

    blobStream.on('finish', async () => {
      const receiptImageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        const subResult = await transaction.request()
          .input('UserID', sql.Int, userId)
          .input('PlanID', sql.Int, planId)
          .query(`
            INSERT INTO Subscriptions (UserID, PlanID, StartDate, EndDate, PaymentStatus)
            OUTPUT INSERTED.SubscriptionID
            VALUES (@UserID, @PlanID, CAST(GETDATE() AS DATE), CAST(GETDATE() AS DATE), 'U')
          `);

        const subscriptionId = subResult.recordset[0].SubscriptionID;

        await transaction.request()
          .input('SubscriptionID', sql.Int, subscriptionId)
          .input('AmountPaid', sql.Decimal(10, 2), amountPaid)
          .input('PaymentMethod', sql.VarChar(50), paymentMethod)
          .input('ReferenceNumber', sql.VarChar(100), referenceNumber)
          .input('ReceiptImageUrl', sql.VarChar(500), receiptImageUrl)
          .query(`
            INSERT INTO Payments (SubscriptionID, AmountPaid, PaymentDate, PaymentMethod, ReferenceNumber, ReceiptImageUrl, Status)
            VALUES (@SubscriptionID, @AmountPaid, GETDATE(), @PaymentMethod, @ReferenceNumber, @ReceiptImageUrl, 'P')
          `);

        await transaction.commit();

        res.status(201).json({
          success: true,
          message: 'Comprobante de pago reportado con éxito. Queda en estado pendiente de aprobación.',
          receiptImageUrl
        });
      } catch (err) {
        await transaction.rollback();
        console.error('Error guardando en BD tras subir a GCS:', err);
        return res.status(500).json({ success: false, message: 'Error guardando en la base de datos.' });
      }
    });

    blobStream.end(req.file.buffer);

  } catch (error) {
    console.error('Error al registrar el pago del socio:', error);
    res.status(500).json({ success: false, message: 'Error interno al registrar el comprobante de pago.', error: error.message });
  }
};

exports.webhookPayment = async (req, res) => {
  const { ReferenceNumber, Status } = req.body;
  
  if (!ReferenceNumber || Status !== 'Approved') {
    return res.status(400).json({ success: false, message: 'Payload inválido o pago no aprobado.' });
  }

  try {
    const pool = await poolPromise;
    const detailResult = await pool.request()
      .input('ReferenceNumber', sql.VarChar(100), ReferenceNumber)
      .query(`
        SELECT p.PaymentID, p.SubscriptionID, p.ReceiptImageUrl, pl.DurationDays, u.Email, u.FirstName, u.UserID as targetUserId
        FROM Payments p
        INNER JOIN Subscriptions s ON p.SubscriptionID = s.SubscriptionID
        INNER JOIN Plans pl ON s.PlanID = pl.PlanID
        INNER JOIN Users u ON s.UserID = u.UserID
        WHERE p.ReferenceNumber = @ReferenceNumber AND p.Status = 'P'
      `);

    if (detailResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Pago pendiente no encontrado para esa referencia.' });
    }

    const { PaymentID, SubscriptionID, ReceiptImageUrl, DurationDays, Email, FirstName, targetUserId } = detailResult.recordset[0];

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // LastModifiedBy = NULL for automated system
      await transaction.request()
        .input('PaymentID', sql.Int, PaymentID)
        .query("UPDATE Payments SET Status = 'A', LastModifiedBy = NULL WHERE PaymentID = @PaymentID");

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

      await transaction.commit();

      await emailService.sendPaymentApprovedEmail(targetUserId, Email, FirstName, true, ReceiptImageUrl);

      res.json({ success: true, message: 'Webhook procesado y suscripción activada automáticamente.' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Error procesando webhook de pago:', error);
    res.status(500).json({ success: false, message: 'Error interno procesando webhook.', error: error.message });
  }
};