/**
 * emailTemplates.js
 * Centralized HTML templates for the Slimming Gym email system.
 */

const baseHtml = (title, content, preheader = "") => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <!--[if mso]>
    <style type="text/css">
        table {border-collapse: collapse; margin: 0; padding: 0;}
    </style>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=Open+Sans:wght@400;600&display=swap');
        
        body {
            font-family: 'Open Sans', Arial, sans-serif;
            background-color: #0f172a;
            margin: 0;
            padding: 0;
            color: #e2e8f0 !important;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #0f172a;
            padding: 40px 20px;
        }
        .main-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1e293b;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            border: 1px solid #334155;
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-family: 'Montserrat', Arial, sans-serif;
            font-weight: 800;
            font-size: 32px;
            letter-spacing: 2px;
            text-transform: uppercase;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header h1 span {
            color: #111827;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.8;
            font-size: 16px;
            color: #e2e8f0;
        }
        .content h2 {
            color: #ffffff;
            font-family: 'Montserrat', Arial, sans-serif;
            font-weight: 600;
            margin-top: 0;
            font-size: 24px;
            border-bottom: 2px solid #334155;
            padding-bottom: 10px;
        }
        .highlight-box {
            background: linear-gradient(145deg, #1e293b, #0f172a);
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            color: #f8fafc;
        }
        .highlight-box strong {
            color: #ef4444;
            display: block;
            margin-bottom: 8px;
            font-family: 'Montserrat', Arial, sans-serif;
            font-size: 18px;
        }
        .btn-container {
            text-align: center;
            margin-top: 35px;
            margin-bottom: 20px;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(90deg, #ef4444, #dc2626);
            color: #ffffff !important;
            text-decoration: none;
            padding: 15px 35px;
            border-radius: 50px;
            font-family: 'Montserrat', Arial, sans-serif;
            font-weight: 600;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
            transition: all 0.3s ease;
        }
        .btn:hover {
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
            transform: translateY(-2px);
        }
        .footer {
            background-color: #0f172a;
            padding: 25px 20px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
        }
        .social-icons {
            margin-bottom: 15px;
        }
        .social-icons a {
            color: #94a3b8;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 600;
        }
        p {
            margin: 0 0 15px 0;
            color: #e2e8f0;
        }
        b, strong {
            color: #ffffff;
        }
    </style>
</head>
<body>
    <!-- Preheader Text (Hidden in email body, visible in inbox list) -->
    <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        ${preheader}
    </div>
    
    <div class="wrapper">
        <div class="main-container">
            <div class="header">
                <h1>SLIMMING <span>GYM</span></h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <div class="social-icons">
                    <a href="#">Instagram</a> | <a href="#">Facebook</a> | <a href="#">Twitter</a>
                </div>
                <p>Este es un correo generado automáticamente. Por favor, no respondas a este mensaje.</p>
                <p>&copy; ${new Date().getFullYear()} Slimming Gym Fitness. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

exports.getWelcomeTemplate = (firstName) => {
    const title = "¡Bienvenido a Slimming Gym!";
    const preheader = "Prepárate para alcanzar tus metas. Tu cuenta ha sido creada exitosamente.";
    const content = `
        <h2>¡Hola ${firstName}! 💪</h2>
        <p>Estamos emocionados de darte la bienvenida oficial a la familia <strong>Slimming Gym Fitness</strong>.</p>
        <p>Tu cuenta ha sido creada exitosamente. Has dado el primer paso hacia tu mejor versión. Prepárate para alcanzar tus metas, superar tus límites y transformar tu vida con nosotros.</p>
        
        <div class="highlight-box">
            <strong>¿Qué sigue ahora?</strong>
            Ingresa a tu cuenta, explora nuestros planes disponibles, conoce a nuestros entrenadores y comienza tu entrenamiento hoy mismo. ¡El momento es ahora!
        </div>
        
        <p>Si tienes alguna duda o necesitas ayuda para empezar, nuestro equipo de entrenadores expertos está listo para asesorarte en cada paso del camino.</p>
        
        <div class="btn-container">
            <a href="http://localhost:5173/login" class="btn">Ingresar a mi cuenta</a>
        </div>
    `;
    return baseHtml(title, content, preheader);
};

exports.getPaymentApprovedTemplate = (firstName, isAutomatic) => {
    const title = "¡Pago Aprobado!";
    const preheader = "Tu membresía está activa. Ya puedes disfrutar de todas nuestras instalaciones.";
    const autoText = isAutomatic 
        ? "hemos recibido y procesado automáticamente la confirmación de tu pago." 
        : "tu comprobante de pago ha sido revisado y aprobado exitosamente por nuestro equipo.";
    
    const content = `
        <h2>¡Excelente noticia, ${firstName}! 🎉</h2>
        <p>Queremos informarte que ${autoText}</p>
        
        <div class="highlight-box">
            <strong>Tu membresía está Activa</strong>
            Ya tienes acceso completo e ilimitado a todas nuestras instalaciones, rutinas personalizadas y reservas de clases según tu plan elegido.
        </div>
        
        <p>Recuerda revisar tus rutinas asignadas en tu panel y reservar tus clases favoritas con anticipación. ¡Nos vemos en la zona de pesas!</p>
        
        <div class="btn-container">
            <a href="http://localhost:5173/member" class="btn">Ir a mi Panel</a>
        </div>
    `;
    return baseHtml(title, content, preheader);
};

exports.getClassJoinedTemplate = (firstName, className, startTime, coachName) => {
    const title = "Confirmación de Reserva de Clase";
    const preheader = `Has reservado tu lugar para ${className}. ¡Prepárate para sudar!`;
    
    // Format date nicely
    const dateObj = new Date(startTime);
    const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const content = `
        <h2>¡Reserva Confirmada, ${firstName}! 🔥</h2>
        <p>Has asegurado exitosamente tu lugar en la clase de <strong>${className}</strong>.</p>
        <p>Nos encanta ver tu compromiso. Prepárate con ropa cómoda, hidratación y toda la energía.</p>
        
        <div class="highlight-box">
            <strong>Detalles de tu Clase</strong>
            • <b>Clase:</b> ${className}<br/>
            • <b>Instructor:</b> ${coachName}<br/>
            • <b>Fecha:</b> ${dateStr}<br/>
            • <b>Hora:</b> ${timeStr}
        </div>
        
        <p>Te recomendamos llegar 10 minutos antes para prepararte. Si por alguna razón no puedes asistir, recuerda cancelar tu reserva desde tu panel para ceder tu lugar a otro compañero.</p>
        
        <div class="btn-container">
            <a href="http://localhost:5173/member" class="btn">Ver mis Reservas</a>
        </div>
    `;
    return baseHtml(title, content, preheader);
};
