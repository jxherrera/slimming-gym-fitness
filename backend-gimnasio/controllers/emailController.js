const { poolPromise, sql } = require('../config/db');
const emailService = require('../services/emailService');

exports.sendAdminEmail = async (req, res) => {
  const { recipientType, role, userId, subject, body } = req.body;
  const adminId = req.user?.id || 1; // ID del administrador que envía

  if (!recipientType || !subject || !body) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  try {
    const pool = await poolPromise;
    let query = '';
    const request = pool.request();

    if (recipientType === 'all') {
      query = `SELECT UserID, Email FROM Users WHERE Status = 'A' AND Email IS NOT NULL AND Email != ''`;
    } else if (recipientType === 'role') {
      if (!role) {
        return res.status(400).json({ success: false, message: 'Debe especificar el rol' });
      }
      let roleId;
      if (role === 'admin') roleId = 3;
      else if (role === 'coach') roleId = 2;
      else if (role === 'member') roleId = 1;
      else return res.status(400).json({ success: false, message: 'Rol no válido' });

      query = `SELECT UserID, Email FROM Users WHERE Status = 'A' AND RoleID = @RoleID AND Email IS NOT NULL AND Email != ''`;
      request.input('RoleID', sql.Int, roleId);
    } else if (recipientType === 'specific') {
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Debe especificar el usuario' });
      }
      query = `SELECT UserID, Email FROM Users WHERE Status = 'A' AND UserID = @UserID AND Email IS NOT NULL AND Email != ''`;
      request.input('UserID', sql.Int, userId);
    } else {
      return res.status(400).json({ success: false, message: 'Tipo de destinatario no válido' });
    }

    const result = await request.query(query);
    const users = result.recordset;

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron usuarios con los criterios especificados o sin correo registrado.' });
    }

    // Plantilla simple con HTML
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f75c2b; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Notificación - Slimming Gym</h2>
        </div>
        <div style="padding: 30px; color: #333; line-height: 1.6;">
          ${body.replace(/\n/g, '<br/>')}
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          <p>Este es un mensaje automático enviado por la administración de Slimming Gym. Por favor, no respondas a este correo.</p>
        </div>
      </div>
    `;

    let sentCount = 0;
    // Enviar correos
    for (const user of users) {
      const success = await emailService.sendEmailAndLog(user.UserID, user.Email, subject, htmlTemplate, 'AdminMessage');
      if (success) {
        sentCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `Correos enviados correctamente a ${sentCount} de ${users.length} usuarios.`,
      sentCount,
      totalCount: users.length
    });

  } catch (error) {
    console.error('Error al enviar correos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

exports.getAllUsersForEmail = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT 
        UserID as id, 
        FirstName as firstName, 
        LastName as lastName, 
        Email as email,
        RoleID as roleId
      FROM Users 
      WHERE Status = 'A' AND Email IS NOT NULL AND Email != ''
      ORDER BY FirstName, LastName
    `;
    const result = await pool.request().query(query);
    
    // Mapear roleId a nombre
    const users = result.recordset.map(u => {
      let roleName = 'Socio';
      if (u.roleId === 2) roleName = 'Entrenador';
      if (u.roleId === 3) roleName = 'Admin';
      return {
        ...u,
        name: `${u.firstName} ${u.lastName}`,
        roleName
      };
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error al obtener usuarios para correo:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
