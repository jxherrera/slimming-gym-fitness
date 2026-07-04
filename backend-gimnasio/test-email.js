const emailService = require('./services/emailService');

async function testEmail() {
    console.log("Iniciando prueba de correo...");

    // Cambia esto por tu correo real para ver si te llega
    const emailDestino = "josuexavi728@gmail.com";

    // Opcional: pasamos null al userId para que no intente guardar en la base de datos
    // o pasamos 1 si el UserID 1 existe en tu base de datos para probar el log.
    const userId = null;

    try {
        const resultado = await emailService.sendEmailAndLog(
            userId,
            emailDestino,
            "Prueba de Integración Slimming Gym",
            "<h1>¡Felicidades!</h1><p>Si estás viendo esto, significa que el servicio de correos de NodeMailer está perfectamente configurado y funcionando.</p>",
            "Prueba"
        );

        if (resultado) {
            console.log("¡Éxito! El correo fue enviado a", emailDestino);
        } else {
            console.log("Fallo. Revisa las credenciales en tu archivo .env");
        }
    } catch (error) {
        console.error("Error crítico ejecutando la prueba:", error);
    }

    process.exit();
}

testEmail();
