const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');

class UserService {
  async getUsersByRole(roleId, roleName) {
    const pool = await poolPromise;
    const query = `
      SELECT
        u.UserID, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.Status,
        (
          SELECT TOP 1 p.PlanName
          FROM Subscriptions s
          INNER JOIN Plans p ON s.PlanID = p.PlanID
          WHERE s.UserID = u.UserID AND s.PaymentStatus = 'P'
            AND s.StartDate <= GETDATE() AND s.EndDate >= GETDATE()
          ORDER BY s.SubscriptionID DESC
        ) AS PlanName
      FROM Users u
      WHERE u.RoleID = @RoleID
    `;

    const result = await pool.request().input('RoleID', sql.Int, roleId).query(query);

    return result.recordset.map((user) => ({
      id: user.UserID,
      firstName: user.FirstName,
      lastName: user.LastName,
      name: `${user.FirstName} ${user.LastName}`,
      email: user.Email,
      phone: user.PhoneNumber || '',
      specialty: roleName === 'Coach' ? 'N/A' : undefined,
      plan: roleName === 'Member' ? (user.PlanName || 'Sin plan') : undefined,
      status: user.Status
    }));
  }

  async getDashboardSummary() {
    const pool = await poolPromise;
    const summaryQuery = `
      SELECT
        SUM(CASE WHEN u.RoleID = 1 THEN 1 ELSE 0 END) AS MemberCount,
        SUM(CASE WHEN u.RoleID = 2 THEN 1 ELSE 0 END) AS CoachCount,
        COALESCE(SUM(p.Price), 0) AS Revenue
      FROM Users u
      LEFT JOIN Subscriptions s ON u.UserID = s.UserID
        AND s.PaymentStatus = 'P' AND s.StartDate <= GETDATE() AND s.EndDate >= GETDATE()
      LEFT JOIN Plans p ON s.PlanID = p.PlanID
      WHERE u.Status = 'A'
    `;

    const result = await pool.request().query(summaryQuery);
    const row = result.recordset[0] || {};
    
    return {
      members: Number(row.MemberCount || 0),
      coaches: Number(row.CoachCount || 0),
      estimatedRevenue: Number(row.Revenue || 0)
    };
  }

  async updateUser(userId, data) {
    const pool = await poolPromise;
    const query = `
      UPDATE Users
      SET FirstName = @FirstName, LastName = @LastName, Email = @Email, PhoneNumber = @PhoneNumber
      WHERE UserID = @UserID
    `;

    const result = await pool.request()
      .input('FirstName', sql.VarChar, data.firstName)
      .input('LastName', sql.VarChar, data.lastName)
      .input('Email', sql.VarChar, data.email)
      .input('PhoneNumber', sql.VarChar, data.phone || null)
      .input('UserID', sql.Int, userId)
      .query(query);

    if (result.rowsAffected[0] === 0) throw new AppError('Usuario no encontrado.', 404);
  }

  async setStatus(userId, status) {
    const pool = await poolPromise;
    const query = `UPDATE Users SET Status = @Status WHERE UserID = @UserID`;

    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('Status', sql.Char(1), status)
      .query(query);

    if (result.rowsAffected[0] === 0) throw new AppError('Usuario no encontrado.', 404);
  }

  async hardDeleteUser(userId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);
      request.input('UserID', sql.Int, userId);

      await request.query(`DELETE FROM Payments WHERE SubscriptionID IN (SELECT SubscriptionID FROM Subscriptions WHERE UserID = @UserID)`);
      await request.query(`DELETE FROM Subscriptions WHERE UserID = @UserID`);
      await request.query(`DELETE FROM RoutineExercises WHERE RoutineID IN (SELECT RoutineID FROM Routines WHERE UserID = @UserID)`);
      await request.query(`DELETE FROM Routines WHERE UserID = @UserID`);
      await request.query(`DELETE FROM ClassReservations WHERE UserID = @UserID`);
      await request.query(`DELETE FROM Attendance WHERE UserID = @UserID`);
      await request.query(`DELETE FROM Notifications WHERE UserID = @UserID`);
      await request.query(`DELETE FROM PhysicalEvaluations WHERE UserID = @UserID OR CoachID = @UserID`);
      await request.query(`DELETE FROM AuditLogs WHERE ChangedByUserID = @UserID`);
      await request.query(`DELETE FROM EmailLogs WHERE UserID = @UserID`);
      await request.query(`DELETE FROM ClassReservations WHERE ClassID IN (SELECT ClassID FROM Classes WHERE CoachID = @UserID)`);
      await request.query(`DELETE FROM Classes WHERE CoachID = @UserID`);
      await request.query(`DELETE FROM CoachPermissions WHERE CoachID = @UserID`);
      await request.query(`DELETE FROM CoachAssignments WHERE CoachID = @UserID OR MemberID = @UserID`);
      await request.query(`DELETE FROM CoachWorkHours WHERE CoachID = @UserID`);
      
      const result = await request.query(`DELETE FROM Users WHERE UserID = @UserID`);

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback();
        throw new AppError('Usuario no encontrado.', 404);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getUserSubscription(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT TOP 1
          s.SubscriptionID as subscriptionId, s.StartDate as startDate, s.EndDate as endDate,
          s.PaymentStatus as paymentStatus, p.PlanID as planId, p.PlanName as planName,
          p.DurationDays as durationDays, p.Price as price, DATEDIFF(day, GETDATE(), s.EndDate) AS remainingDays,
          (
            SELECT TOP 1 Status FROM Payments pay WHERE pay.SubscriptionID = s.SubscriptionID ORDER BY pay.PaymentID DESC
          ) AS paymentRequestStatus
        FROM Subscriptions s
        INNER JOIN Plans p ON s.PlanID = p.PlanID
        WHERE s.UserID = @UserID
        ORDER BY s.SubscriptionID DESC
      `);

    return result.recordset[0] || null;
  }

  async getUserNotifications(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT NotificationID as id, Message as message, IsRead as isRead, CreatedAt as createdAt
        FROM Notifications WHERE UserID = @UserID ORDER BY CreatedAt DESC
      `);

    return result.recordset;
  }

  async markNotificationRead(userId, notifId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('NotificationID', sql.Int, notifId)
      .query(`UPDATE Notifications SET IsRead = 1 WHERE UserID = @UserID AND NotificationID = @NotificationID`);

    if (result.rowsAffected[0] === 0) throw new AppError('Notificación no encontrada o no pertenece al usuario.', 404);
  }

  async getUserPayments(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT 
          p.PaymentID as paymentId, p.AmountPaid as amountPaid, p.PaymentDate as paymentDate,
          p.PaymentMethod as paymentMethod, p.ReferenceNumber as referenceNumber,
          p.ReceiptUrl as receiptUrl, p.Status as status, pl.PlanName as planName
        FROM Payments p
        INNER JOIN Subscriptions s ON p.SubscriptionID = s.SubscriptionID
        INNER JOIN Plans pl ON s.PlanID = pl.PlanID
        WHERE s.UserID = @UserID
        ORDER BY p.PaymentDate DESC
      `);

    return result.recordset;
  }

  async changePasswordByAdmin(userId, newPassword) {
    const pool = await poolPromise;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('PasswordHash', sql.VarChar, passwordHash)
      .query(`UPDATE Users SET PasswordHash = @PasswordHash WHERE UserID = @UserID`);

    if (result.rowsAffected[0] === 0) throw new AppError('Usuario no encontrado.', 404);
  }

  async changeUserPassword(userId, currentPassword, newPassword) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query('SELECT PasswordHash FROM Users WHERE UserID = @UserID');

    if (result.recordset.length === 0) throw new AppError('Usuario no encontrado.', 404);

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(currentPassword, user.PasswordHash);

    if (!isMatch) throw new AppError('La contraseña actual es incorrecta.', 400);

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await pool.request()
      .input('UserID', sql.Int, userId)
      .input('PasswordHash', sql.VarChar, newPasswordHash)
      .query('UPDATE Users SET PasswordHash = @PasswordHash WHERE UserID = @UserID');
  }
}

module.exports = new UserService();
