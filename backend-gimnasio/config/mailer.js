const nodemailer = require('nodemailer');
const { poolPromise, sql } = require('./db');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 *  enviar correos y registrar el log en la base de datos 
 * @param {number} userId 
 * @param {string} to 
 * @param {string} subject 
 * @param {string} html 
 * @param {string} emailType 
 */
async function sendEmailAndLog(userId, to, subject, html, emailType) {
  let status = 'Pendiente';
  try {
    const info = await transporter.sendMail({
      from: `"Slimming Gym" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html
    });
    console.log(`Correo enviado a ${to}: ${info.messageId}`);
    status = 'Éxito';
    return true;
  } catch (error) {
    console.error(`Error enviando correo a ${to}:`, error);
    status = 'Fallo';
    return false;
  } finally {
    if (userId) {
      try {
        const pool = await poolPromise;
        await pool.request()
          .input('UserID', sql.Int, userId)
          .input('EmailType', sql.VarChar(50), emailType)
          .input('Status', sql.VarChar(20), status)
          .query(`
            INSERT INTO EmailLogs (UserID, EmailType, Status)
            VALUES (@UserID, @EmailType, @Status)
          `);
      } catch (dbError) {
        console.error('Error insertando el log de correo:', dbError);
      }
    }
  }
}

module.exports = {
  transporter,
  sendEmailAndLog
};
