const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_API = PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

let cachedToken = null;
let tokenExpiry = null;

function isPaypalConfigured() {
    return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

if (!isPaypalConfigured()) {
    console.warn('⚠️  PayPal credentials not found. PayPal integration is disabled.');
}

async function obtenerToken() {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to obtain PayPal token: ${err}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    // expires_in is in seconds, buffer of 5 minutes (300000 ms)
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 300000; 

    return cachedToken;
}

async function crearOrden(planId, price) {
    if (!isPaypalConfigured()) throw new Error('PayPal no configurado');
    const token = await obtenerToken();
    const currency = process.env.PAYPAL_CURRENCY || 'USD';
    
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                custom_id: planId.toString(),
                amount: {
                    currency_code: currency,
                    value: price.toString()
                }
            }]
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to create PayPal order: ${err}`);
    }

    const data = await response.json();
    return data.id;
}

async function capturarOrden(orderId) {
    if (!isPaypalConfigured()) throw new Error('PayPal no configurado');
    const token = await obtenerToken();
    
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            // Prefer: return=representation indicates to paypal to return the full object
            'Prefer': 'return=representation'
        }
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to capture PayPal order: ${err}`);
    }

    const data = await response.json();
    
    let status = data.status;
    let captureId = null;
    let amountCaptured = null;
    let customId = null;

    if (data.purchase_units && data.purchase_units.length > 0) {
        const unit = data.purchase_units[0];
        customId = unit.custom_id;
        
        if (unit.payments && unit.payments.captures && unit.payments.captures.length > 0) {
            const capture = unit.payments.captures[0];
            captureId = capture.id;
            amountCaptured = capture.amount.value;
            status = capture.status;
        }
    }

    return {
        status,
        captureId,
        amountCaptured,
        customId
    };
}

async function verificarFirmaWebhook(headers, body) {
    if (!isPaypalConfigured()) return false;
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
        console.warn('⚠️  PAYPAL_WEBHOOK_ID not found, cannot verify webhook.');
        return false;
    }

    const token = await obtenerToken();
    
    const response = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: webhookId,
            webhook_event: typeof body === 'string' ? JSON.parse(body) : body
        })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error(`Failed to verify webhook signature: ${err}`);
        return false;
    }

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
}

module.exports = {
    isPaypalConfigured,
    crearOrden,
    capturarOrden,
    verificarFirmaWebhook
};
