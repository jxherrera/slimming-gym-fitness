const { poolPromise, sql } = require('../config/db');
const paypal = require('../services/paypalService');
const { validarCaptura, calcularFechaFin, construirConfigPublica } = require('../utils/paypalRules');
const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../services/emailService');

const METODO_PAGO = 'PayPal';

/** Consulta el plan en la base. El precio SIEMPRE se toma de aqui. */
const obtenerPlan = async (pool, planId) => {
    const resultado = await pool.request()
        .input('PlanID', sql.Int, planId)
        .query('SELECT PlanID, PlanName, Price, DurationDays FROM Plans WHERE PlanID = @PlanID');

    return resultado.recordset[0] || null;
};

/**
 * Registra la suscripcion y el pago de forma idempotente.
 *
 * Si el identificador de captura ya existe, no crea nada y lo informa: el
 * navegador puede reintentar la captura, y el webhook puede llegar duplicado o
 * despues de que el propio navegador ya la proceso.
 */
const registrarPagoAprobado = async (pool, { userId, plan, captura }) => {
    const yaRegistrado = await pool.request()
        .input('ReferenceNumber', sql.VarChar(100), captura.captureId)
        .query('SELECT TOP 1 PaymentID FROM Payments WHERE ReferenceNumber = @ReferenceNumber');

    if (yaRegistrado.recordset.length > 0) {
        return { duplicado: true, paymentId: yaRegistrado.recordset[0].PaymentID };
    }

    const inicio = new Date();
    const fin = calcularFechaFin(inicio, plan.DurationDays);

    const transaccion = new sql.Transaction(pool);
    await transaccion.begin();

    try {
        const sub = await transaccion.request()
            .input('UserID', sql.Int, userId)
            .input('PlanID', sql.Int, plan.PlanID)
            .input('EndDate', sql.Date, fin)
            .query(`
                INSERT INTO Subscriptions (UserID, PlanID, StartDate, EndDate, PaymentStatus)
                OUTPUT INSERTED.SubscriptionID
                VALUES (@UserID, @PlanID, CAST(GETDATE() AS DATE), @EndDate, 'P')
            `);

        const subscriptionId = sub.recordset[0].SubscriptionID;

        // El pago entra directamente como aprobado ('A'): PayPal ya confirmo el
        // cobro, por lo que no requiere la verificacion manual del administrador.
        const pago = await transaccion.request()
            .input('SubscriptionID', sql.Int, subscriptionId)
            .input('AmountPaid', sql.Decimal(10, 2), Number(captura.amount))
            .input('PaymentMethod', sql.VarChar(50), METODO_PAGO)
            .input('ReferenceNumber', sql.VarChar(100), captura.captureId)
            .query(`
                INSERT INTO Payments (SubscriptionID, AmountPaid, PaymentDate, PaymentMethod, ReferenceNumber, Status)
                OUTPUT INSERTED.PaymentID
                VALUES (@SubscriptionID, @AmountPaid, GETDATE(), @PaymentMethod, @ReferenceNumber, 'A')
            `);

        await transaccion.commit();

        return { duplicado: false, paymentId: pago.recordset[0].PaymentID, subscriptionId, fin };
    } catch (err) {
        await transaccion.rollback();
        throw err;
    }
};

/**
 * GET /api/payments/paypal/config
 *
 * Publico. Entrega al navegador solo lo necesario para cargar el boton.
 * Se sirve desde la API en lugar de incrustarlo al compilar el frontend para
 * poder cambiar de sandbox a produccion sin reconstruir la imagen.
 */
exports.getConfig = (req, res) => {
    res.json(construirConfigPublica(process.env));
};

/**
 * POST /api/payments/paypal/order
 *
 * Recibe unicamente { planId }. El importe se resuelve en el servidor: si se
 * aceptara del cliente, cualquiera podria pedir una orden de 0,01 por un plan
 * completo.
 */
exports.createOrder = asyncHandler(async (req, res) => {
    if (!paypal.isPaypalConfigured()) {
        return res.status(503).json({ success: false, message: 'El pago en línea no está disponible en este momento.' });
    }

    const planId = Number(req.body?.planId);
    if (!planId) {
        return res.status(400).json({ success: false, message: 'Debes indicar el plan que deseas adquirir.' });
    }

    const pool = await poolPromise;
    const plan = await obtenerPlan(pool, planId);

    if (!plan) {
        return res.status(404).json({ success: false, message: 'El plan seleccionado no existe.' });
    }

    const orderId = await paypal.crearOrden({
        planId: plan.PlanID,
        planName: plan.PlanName,
        precio: plan.Price
    });

    res.json({ success: true, orderId });
});

/**
 * POST /api/payments/paypal/capture
 *
 * Cobra la orden aprobada, contrasta el importe contra la base y activa la
 * membresia. El socio se toma del token: nadie puede activar la membresia de otro.
 */
exports.captureOrder = asyncHandler(async (req, res) => {
    if (!paypal.isPaypalConfigured()) {
        return res.status(503).json({ success: false, message: 'El pago en línea no está disponible en este momento.' });
    }

    const { orderId } = req.body || {};
    const planId = Number(req.body?.planId);
    const userId = req.user?.userId;

    if (!orderId || !planId) {
        return res.status(400).json({ success: false, message: 'Faltan datos de la orden.' });
    }

    const pool = await poolPromise;
    const plan = await obtenerPlan(pool, planId);

    if (!plan) {
        return res.status(404).json({ success: false, message: 'El plan seleccionado no existe.' });
    }

    const captura = await paypal.capturarOrden(orderId);
    const veredicto = validarCaptura(captura, plan.Price);

    if (!veredicto.valida) {
        // Se registra con nivel de error: un importe que no cuadra puede indicar
        // manipulacion de la orden y debe quedar rastro para auditoria.
        console.error(`[PayPal] Captura rechazada (orden ${orderId}, socio ${userId}): ${veredicto.motivo}`);
        return res.status(400).json({ success: false, message: veredicto.motivo });
    }

    const resultado = await registrarPagoAprobado(pool, { userId, plan, captura });

    if (resultado.duplicado) {
        return res.json({
            success: true,
            message: 'Este pago ya había sido registrado. Tu membresía está activa.',
            duplicado: true
        });
    }

    const usuario = await pool.request()
        .input('UserID', sql.Int, userId)
        .query('SELECT Email, FirstName FROM Users WHERE UserID = @UserID');

    const datos = usuario.recordset[0];
    if (datos?.Email) {
        // Fuera de la transaccion: un fallo de correo no debe deshacer el cobro.
        emailService.sendPaymentApprovedEmail(userId, datos.Email, datos.FirstName, true, null)
            .catch((err) => console.error('Error enviando el correo de pago aprobado:', err.message));
    }

    res.status(201).json({
        success: true,
        message: 'Pago procesado correctamente. Tu membresía ya está activa.',
        endDate: resultado.fin,
        paymentId: resultado.paymentId
    });
});

/**
 * POST /api/payments/paypal/webhook
 *
 * Respaldo asincrono para cuando el navegador se cierra entre la aprobacion y la
 * captura. Publico por necesidad, autenticado por la firma de PayPal.
 */
exports.webhook = asyncHandler(async (req, res) => {
    const firmaValida = await paypal.verificarFirmaWebhook(req.headers, req.body);

    if (!firmaValida) {
        console.warn('[PayPal] Webhook rechazado: firma inválida o ausente.');
        return res.status(401).json({ success: false, message: 'Firma de webhook inválida.' });
    }

    const evento = req.body?.event_type;

    // Se responde 200 a cualquier evento reconocido pero no procesado: PayPal
    // reintenta durante dias si no recibe 200 y saturaria el registro.
    if (evento !== 'PAYMENT.CAPTURE.COMPLETED') {
        return res.json({ success: true, message: `Evento ${evento} recibido y omitido.` });
    }

    const recurso = req.body?.resource || {};
    const captura = {
        status: recurso.status,
        captureId: recurso.id,
        amount: recurso.amount?.value,
        customId: recurso.custom_id
    };

    const planId = Number(captura.customId);
    if (!planId) {
        console.error('[PayPal] Webhook sin custom_id: no se puede asociar el pago a un plan.');
        return res.json({ success: true, message: 'Evento sin plan asociado, omitido.' });
    }

    const pool = await poolPromise;
    const plan = await obtenerPlan(pool, planId);

    if (!plan) {
        console.error(`[PayPal] Webhook con plan inexistente (${planId}).`);
        return res.json({ success: true, message: 'Plan no encontrado, omitido.' });
    }

    const veredicto = validarCaptura(captura, plan.Price);
    if (!veredicto.valida) {
        console.error(`[PayPal] Webhook con captura inválida: ${veredicto.motivo}`);
        return res.json({ success: true, message: 'Captura no válida, omitida.' });
    }

    // El webhook no lleva sesion: el socio se identifica por la suscripcion ya
    // creada durante la captura. Si el navegador no llego a capturar, no hay
    // usuario asociable y el evento se omite: el socio puede reintentar.
    const existente = await pool.request()
        .input('ReferenceNumber', sql.VarChar(100), captura.captureId)
        .query('SELECT TOP 1 PaymentID FROM Payments WHERE ReferenceNumber = @ReferenceNumber');

    if (existente.recordset.length > 0) {
        return res.json({ success: true, message: 'Pago ya registrado.' });
    }

    console.warn(`[PayPal] Captura ${captura.captureId} confirmada por webhook sin registro previo. Requiere revisión manual.`);
    res.json({ success: true, message: 'Evento recibido.' });
});
