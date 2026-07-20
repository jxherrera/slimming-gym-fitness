const { poolPromise, sql } = require('../config/db');

async function runSeeders() {
  console.log('🚀 Iniciando ejecución de Seeders para Slimming Gym Fitness...');

  try {
    const pool = await poolPromise;

    // 1. Cargar / Verificar Roles
    console.log('📦 Verificando Roles base...');
    const rolesList = ['Guest', 'Admin', 'Member', 'Coach'];
    for (const roleName of rolesList) {
      const checkRole = await pool.request()
        .input('RoleName', sql.VarChar(50), roleName)
        .query('SELECT RoleID FROM dbo.Roles WHERE RoleName = @RoleName');

      if (checkRole.recordset.length === 0) {
        await pool.request()
          .input('RoleName', sql.VarChar(50), roleName)
          .query('INSERT INTO dbo.Roles (RoleName) VALUES (@RoleName)');
        console.log(`  [+] Rol '${roleName}' insertado.`);
      } else {
        console.log(`  [✓] Rol '${roleName}' ya existe.`);
      }
    }

    // Obtener RoleID de Admin
    const adminRoleRes = await pool.request()
      .input('RoleName', sql.VarChar(50), 'Admin')
      .query('SELECT RoleID FROM dbo.Roles WHERE RoleName = @RoleName');
    const adminRoleId = adminRoleRes.recordset[0]?.RoleID || 2;

    // 2. Cargar / Verificar los 3 Planes Base de Suscripción
    console.log('💳 Verificando Planes base de suscripción...');
    const basePlans = [
      { name: 'Plan Básico (Mensual)', price: 29.99, durationDays: 30 },
      { name: 'Plan Pro (Trimestral)', price: 79.99, durationDays: 90 },
      { name: 'Plan VIP (Anual)', price: 279.99, durationDays: 365 }
    ];

    for (const plan of basePlans) {
      const checkPlan = await pool.request()
        .input('PlanName', sql.VarChar(50), plan.name)
        .query('SELECT PlanID FROM dbo.Plans WHERE PlanName = @PlanName');

      if (checkPlan.recordset.length === 0) {
        await pool.request()
          .input('PlanName', sql.VarChar(50), plan.name)
          .input('Price', sql.Decimal(10, 2), plan.price)
          .input('DurationDays', sql.Int, plan.durationDays)
          .query('INSERT INTO dbo.Plans (PlanName, Price, DurationDays, Status) VALUES (@PlanName, @Price, @DurationDays, \'A\')');
        console.log(`  [+] Plan '${plan.name}' ($${plan.price}) insertado.`);
      } else {
        console.log(`  [✓] Plan '${plan.name}' ya existe.`);
      }
    }

    // 3. Cargar / Verificar Superusuario (Admin)
    console.log('👤 Verificando Superusuario Admin...');
    const adminEmail = 'admin@slimminggym.com';
    const checkAdmin = await pool.request()
      .input('Email', sql.VarChar(150), adminEmail)
      .query('SELECT UserID FROM dbo.Users WHERE Email = @Email OR Email = \'admin@admin.com\'');

    if (checkAdmin.recordset.length === 0) {
      // Hash pre-calculado bcrypt de 'admin123'
      const passwordHash = '$2b$10$lLp0rtXG6r/HL3vx1oRlJu71Jwcv/pR7ZFG/sfuDXFHifERmBmt52';
      
      await pool.request()
        .input('IDNumber', sql.VarChar(15), '0000000000')
        .input('FirstName', sql.VarChar(100), 'Super')
        .input('LastName', sql.VarChar(100), 'Admin')
        .input('Email', sql.VarChar(150), adminEmail)
        .input('PasswordHash', sql.VarChar(255), passwordHash)
        .input('PhoneNumber', sql.VarChar(20), '0999999999')
        .input('RoleID', sql.Int, adminRoleId)
        .query(`
          INSERT INTO dbo.Users (IDNumber, FirstName, LastName, Email, PasswordHash, PhoneNumber, RoleID, Status, CreatedAt)
          VALUES (@IDNumber, @FirstName, @LastName, @Email, @PasswordHash, @PhoneNumber, @RoleID, 'A', GETDATE())
        `);
      console.log(`  [+] Superusuario Admin ('${adminEmail}') insertado con éxito.`);
    } else {
      console.log(`  [✓] Superusuario Admin ya existe en la base de datos.`);
    }

    console.log('🎉 Seeders ejecutados exitosamente.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    process.exit(1);
  }
}

// Permitir ejecución directa mediante comando terminal `node seeders/seedRunner.js`
if (require.main === module) {
  runSeeders();
}

module.exports = runSeeders;
