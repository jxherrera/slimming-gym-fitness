const { poolPromise, sql } = require('../config/db');
const { guardarComprobante, eliminarArchivo, isStorageConfigured } = require('../services/storageService');
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

  // El administrador que aprueba se toma del token, NUNCA del cuerpo de la
  // peticion: un dato de auditoria que envia el cliente puede falsificarse, y
  // ademas el frontend enviaba un userId fijo, con lo que todas las
  // aprobaciones quedaban registradas a nombre del mismo usuario.
  const userId = req.user?.userId;

  if (!paymentId) {
    return res.status(400).json({ success: false, message: 'ID de pago no válido.' });
  }

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Sesión no válida para registrar la auditoría.' });
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

  // Igual que en la aprobacion: el responsable se toma del token, no del body.
  const userId = req.user?.userId;

  if (!paymentId) {
    return res.status(400).json({ success: false, message: 'ID de pago no válido.' });
  }

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Sesión no válida para registrar la auditoría.' });
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

    if (!isStorageConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'El almacenamiento de comprobantes no está disponible en el servidor.'
      });
    }

    // El archivo se guarda en el disco de la VM. storageService valida el tipo
    // MIME y asigna un nombre aleatorio con la extension derivada del tipo.
    let comprobante;
    try {
      comprobante = await guardarComprobante(req.file);
    } catch (err) {
      if (err.statusCode === 415) {
        return res.status(415).json({ success: false, message: err.message });
      }
      throw err;
    }

    const receiptImageUrl = comprobante.url;

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

      // El registro en base de datos fallo: se descarta el archivo ya escrito
      // para no dejar comprobantes huerfanos ocupando disco.
      await eliminarArchivo(comprobante.absolutePath);

      console.error('Error guardando el pago en la base de datos:', err);
      return res.status(500).json({ success: false, message: 'Error guardando en la base de datos.' });
    }

  } catch (error) {
    console.error('Error al registrar el pago del socio:', error);
    res.status(500).json({ success: false, message: 'Error interno al registrar el comprobante de pago.', error: error.message });
  }
};

exports.webhookPayment = async (req, res) => {
  // Este endpoint es publico porque lo invoca la pasarela externa, que no puede
  // presentar un JWT. Se autentica con un secreto compartido: sin esta
  // verificacion, cualquiera podria activar suscripciones sin haber pagado.
  const secretoEsperado = process.env.WEBHOOK_SECRET;

  if (!secretoEsperado) {
    console.error('[Webhook] WEBHOOK_SECRET no está definida: se rechaza la petición.');
    return res.status(503).json({ success: false, message: 'Webhook no configurado en el servidor.' });
  }

  if (req.headers['x-webhook-secret'] !== secretoEsperado) {
    console.warn('[Webhook] Petición rechazada: secreto inválido o ausente.');
    return res.status(401).json({ success: false, message: 'Firma de webhook inválida.' });
  }

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

exports.getPaymentHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const pool = await poolPromise;
    let querySpec = `
      FROM Payments p
      INNER JOIN Subscriptions s ON p.SubscriptionID = s.SubscriptionID
      INNER JOIN Users u ON s.UserID = u.UserID
      INNER JOIN Plans pl ON s.PlanID = pl.PlanID
    `;

    const whereClauses = [];
    const requestCount = pool.request();
    const requestData = pool.request();

    if (startDate) {
      whereClauses.push('p.PaymentDate >= @StartDate');
      const start = new Date(startDate);
      requestCount.input('StartDate', sql.DateTime, start);
      requestData.input('StartDate', sql.DateTime, start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClauses.push('p.PaymentDate <= @EndDate');
      requestCount.input('EndDate', sql.DateTime, end);
      requestData.input('EndDate', sql.DateTime, end);
    }

    if (whereClauses.length > 0) {
      querySpec += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // 1. Get total record count
    const countQuery = `SELECT COUNT(*) as total ${querySpec}`;
    const countResult = await requestCount.query(countQuery);
    const totalRecords = countResult.recordset[0].total;

    // 2. Fetch the paginated data
    requestData.input('Offset', sql.Int, offset);
    requestData.input('Limit', sql.Int, limitNum);

    const dataQuery = `
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
      ${querySpec}
      ORDER BY p.PaymentDate DESC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY
    `;

    const dataResult = await requestData.query(dataQuery);

    const totalPages = Math.ceil(totalRecords / limitNum);

    res.json({
      success: true,
      data: dataResult.recordset,
      totalRecords,
      totalPages,
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Error al obtener el historial de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al obtener el historial de pagos.',
      error: error.message
    });
  }
};