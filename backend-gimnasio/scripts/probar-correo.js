/**
 * Prueba de humo del servicio de correo (SMTP / Nodemailer).
 *
 * ENVIA UN CORREO REAL. No es una prueba automatizada: se ejecuta a mano para
 * verificar la configuracion de SMTP_EMAIL y SMTP_PASSWORD, sobre todo al
 * levantar el sistema en un servidor nuevo.
 *
 * Uso:
 *   npm run probar:correo -- destinatario@dominio.com
 *   node scripts/probar-correo.js destinatario@dominio.com
 *
 * Si no se pasa destinatario, se envia a la propia cuenta configurada en
 * SMTP_EMAIL: nunca a una direccion escrita en el codigo.
 */
require('dotenv').config();
const emailService = require('../services/emailService');

async function probarCorreo() {
    const destino = process.argv[2] || process.env.SMTP_EMAIL;

    if (!destino) {
        console.error('ERROR: indica un destinatario o define SMTP_EMAIL en el .env.');
        console.error('Uso: node scripts/probar-correo.js destinatario@dominio.com');
        process.exit(1);
    }

    console.log(`Enviando correo de prueba a ${destino}...`);

    try {
        const enviado = await emailService.sendEmail(
            destino,
            'Prueba de configuracion SMTP - Slimming Gym',
            '<h2>Configuración correcta</h2><p>Si recibes este mensaje, el servicio de correo del sistema está operativo.</p>'
        );

        if (enviado) {
            console.log('OK: el correo fue entregado al servidor SMTP.');
            process.exit(0);
        }

        console.error('FALLO: revisa SMTP_EMAIL y SMTP_PASSWORD en el .env.');
        process.exit(1);
    } catch (error) {
        console.error('Error critico ejecutando la prueba:', error.message);
        process.exit(1);
    }
}

probarCorreo();
