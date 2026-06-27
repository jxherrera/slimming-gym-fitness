const { poolPromise, sql } = require('../config/db');

// Obtener comprobantes de pago pendientes de revisión
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
        p.ReceiptUrl as receiptUrl,
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

// Aprobar comprobante de pago (activa la suscripción del socio)
exports.approvePayment = async (req, res) => {
  const paymentId = Number(req.params.id);

  if (!paymentId) {
    return res.status(400).json({
      success: false,
      message: 'ID de pago no válido.'
    });
  }

  try {
    const pool = await poolPromise;

    // 1. Obtener la suscripción y duración del plan asociadas a este pago
    const detailResult = await pool.request()
      .input('PaymentID', sql.Int, paymentId)
      .query(`
        SELECT p.SubscriptionID, pl.DurationDays
        FROM Payments p
        INNER JOIN Subscriptions s ON p.SubscriptionID = s.SubscriptionID
        INNER JOIN Plans pl ON s.PlanID = pl.PlanID
        WHERE p.PaymentID = @PaymentID
      `);

    if (detailResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron los detalles de la suscripción vinculada a este pago.'
      });
    }

    const { SubscriptionID, DurationDays } = detailResult.recordset[0];

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 2. Marcar pago como aprobado ('A')
      await transaction.request()
        .input('PaymentID', sql.Int, paymentId)
        .query("UPDATE Payments SET Status = 'A' WHERE PaymentID = @PaymentID");

      // 3. Activar la suscripción (PaymentStatus = 'P') y recalcular fechas
      // La suscripción se activa a partir del día de hoy y expira en (DurationDays) días
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

      res.json({
        success: true,
        message: 'Pago aprobado y suscripción activada correctamente.'
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Error al aprobar el pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al aprobar el pago.',
      error: error.message
    });
  }
};

// Rechazar comprobante de pago
exports.rejectPayment = async (req, res) => {
  const paymentId = Number(req.params.id);

  if (!paymentId) {
    return res.status(400).json({
      success: false,
      message: 'ID de pago no válido.'
    });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('PaymentID', sql.Int, paymentId)
      .query("UPDATE Payments SET Status = 'R' WHERE PaymentID = @PaymentID");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado.'
      });
    }

    res.json({
      success: true,
      message: 'Pago rechazado correctamente.'
    });
  } catch (error) {
    console.error('Error al rechazar el pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al rechazar el pago.',
      error: error.message
    });
  }
};

// Permite a un socio registrar un nuevo pago. Crea una suscripción temporal no pagada ('U') y el registro de pago pendiente ('P')
exports.uploadPayment = async (req, res) => {
  const { userId, planId, paymentMethod, referenceNumber, receiptUrl } = req.body;

  if (!userId || !planId || !paymentMethod || !referenceNumber || !receiptUrl) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos (userId, planId, paymentMethod, referenceNumber, receiptUrl).'
    });
  }

  try {
    const pool = await poolPromise;

    // Obtener precio del plan seleccionado
    const planResult = await pool.request()
      .input('PlanID', sql.Int, planId)
      .query('SELECT Price FROM Plans WHERE PlanID = @PlanID');

    if (planResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El plan seleccionado no existe.'
      });
    }

    const amountPaid = planResult.recordset[0].Price;

    // Ejecutar transaccionalmente para garantizar la consistencia de datos entre Subscriptions y Payments
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Registrar la suscripción inicial no pagada ('U') que se activará al aprobar el pago
      const subResult = await transaction.request()
        .input('UserID', sql.Int, userId)
        .input('PlanID', sql.Int, planId)
        .query(`
          INSERT INTO Subscriptions (UserID, PlanID, StartDate, EndDate, PaymentStatus)
          OUTPUT INSERTED.SubscriptionID
          VALUES (@UserID, @PlanID, CAST(GETDATE() AS DATE), CAST(GETDATE() AS DATE), 'U')
        `);

      const subscriptionId = subResult.recordset[0].SubscriptionID;

      // Registrar el pago en estado pendiente ('P') para que pueda ser aprobado por un administrador
      await transaction.request()
        .input('SubscriptionID', sql.Int, subscriptionId)
        .input('AmountPaid', sql.Decimal(10, 2), amountPaid)
        .input('PaymentMethod', sql.VarChar(50), paymentMethod)
        .input('ReferenceNumber', sql.VarChar(100), referenceNumber)
        .input('ReceiptUrl', sql.VarChar(500), receiptUrl)
        .query(`
          INSERT INTO Payments (SubscriptionID, AmountPaid, PaymentDate, PaymentMethod, ReferenceNumber, ReceiptUrl, Status)
          VALUES (@SubscriptionID, @AmountPaid, GETDATE(), @PaymentMethod, @ReferenceNumber, @ReceiptUrl, 'P')
        `);

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Comprobante de pago reportado con éxito. Queda en estado pendiente de aprobación.'
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Error al registrar el pago del socio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al registrar el comprobante de pago.',
      error: error.message
    });
  }
};
