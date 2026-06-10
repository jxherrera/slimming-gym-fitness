const { poolPromise, sql } = require('../config/db');

const roleNames = {
  admin: 'Admin',
  coach: 'Coach',
  member: 'Member'
};

const roleIds = {
  admin: 3,
  coach: 2,
  member: 1
};

exports.getUsersByRole = async (req, res) => {
  const roleParam = req.params.roleName?.toLowerCase();
  const roleName = roleNames[roleParam];
  const roleId = roleIds[roleParam];

  if (!roleName || !roleId) {
    return res.status(400).json({
      success: false,
      message: 'Rol no válido. Usa admin, coach o member.'
    });
  }

  try {
    const pool = await poolPromise;
    const query = `
      SELECT
        u.UserID,
        u.FirstName,
        u.LastName,
        u.Email,
        u.PhoneNumber,
        p.PlanName
      FROM Users u
      LEFT JOIN Subscriptions s ON u.UserID = s.UserID
        AND s.PaymentStatus = 'P'
        AND s.StartDate <= GETDATE()
        AND s.EndDate >= GETDATE()
      LEFT JOIN Plans p ON s.PlanID = p.PlanID
      WHERE u.RoleID = @RoleID
        AND u.Status = 'A'
    `;

    const result = await pool.request()
      .input('RoleID', sql.Int, roleId)
      .query(query);

    const users = result.recordset.map((user) => ({
      id: user.UserID,
      firstName: user.FirstName,
      lastName: user.LastName,
      name: `${user.FirstName} ${user.LastName}`,
      email: user.Email,
      phone: user.PhoneNumber || '',
      specialty: roleName === 'Coach' ? 'N/A' : undefined,
      plan: roleName === 'Member' ? (user.PlanName || 'Sin plan') : undefined
    }));

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al cargar los usuarios.',
      error: error.message
    });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const pool = await poolPromise;

    const summaryQuery = `
      SELECT
        SUM(CASE WHEN u.RoleID = 1 THEN 1 ELSE 0 END) AS MemberCount,
        SUM(CASE WHEN u.RoleID = 2 THEN 1 ELSE 0 END) AS CoachCount,
        COALESCE(SUM(p.Price), 0) AS Revenue
      FROM Users u
      LEFT JOIN Subscriptions s ON u.UserID = s.UserID
        AND s.PaymentStatus = 'P'
        AND s.StartDate <= GETDATE()
        AND s.EndDate >= GETDATE()
      LEFT JOIN Plans p ON s.PlanID = p.PlanID
      WHERE u.Status = 'A'
    `;

    const result = await pool.request().query(summaryQuery);
    const row = result.recordset[0] || {};

    res.json({
      success: true,
      summary: {
        members: Number(row.MemberCount || 0),
        coaches: Number(row.CoachCount || 0),
        estimatedRevenue: Number(row.Revenue || 0)
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al cargar el resumen.',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  const userId = Number(req.params.id);
  const { firstName, lastName, email, phone } = req.body;

  if (!userId || !firstName || !lastName || !email) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios para actualizar el usuario.'
    });
  }

  try {
    const pool = await poolPromise;
    const query = `
      UPDATE Users
      SET FirstName = @FirstName,
          LastName = @LastName,
          Email = @Email,
          PhoneNumber = @PhoneNumber
      WHERE UserID = @UserID
    `;

    const result = await pool.request()
      .input('FirstName', sql.VarChar, firstName)
      .input('LastName', sql.VarChar, lastName)
      .input('Email', sql.VarChar, email)
      .input('PhoneNumber', sql.VarChar, phone || null)
      .input('UserID', sql.Int, userId)
      .query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado correctamente.'
    });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al actualizar el usuario.',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = Number(req.params.id);

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario inválido.'
    });
  }

  try {
    const pool = await poolPromise;
    const query = `
      UPDATE Users
      SET Status = 'I'
      WHERE UserID = @UserID
    `;

    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente.'
    });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al eliminar el usuario.',
      error: error.message
    });
  }
};
