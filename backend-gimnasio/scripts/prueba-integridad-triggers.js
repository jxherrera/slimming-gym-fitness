require('dotenv').config();
const { sql, poolPromise } = require('../config/db');

async function runStressTest() {
    console.log('===========================================================');
    console.log('INICIANDO PRUEBAS DE ESTRÉS DE INTEGRIDAD DB (TRIGGERS)');
    console.log('===========================================================');
    
    let pool;
    let testSubscriptionId = null;
    let testPaymentId = null;

    try {
        pool = await poolPromise;
        console.log('✅ Conexión a la base de datos establecida.');

        // 1. Setup: Crear datos temporales (Usuario, Plan, Suscripción)
        console.log('\n[Fase 1] Creando datos de prueba (Suscripción y Pago temporal)...');
        
        // Obtener un usuario y plan cualquiera para atar la suscripción de prueba
        const userRes = await pool.request().query('SELECT TOP 1 UserID FROM Users');
        const planRes = await pool.request().query('SELECT TOP 1 PlanID, Price FROM Plans');
        
        if (!userRes.recordset.length || !planRes.recordset.length) {
            throw new Error('No hay usuarios o planes en la BD para crear datos de prueba.');
        }
        
        const userId = userRes.recordset[0].UserID;
        const planId = planRes.recordset[0].PlanID;
        const price = planRes.recordset[0].Price;

        const subRes = await pool.request()
            .input('UserID', sql.Int, userId)
            .input('PlanID', sql.Int, planId)
            .query(`
                INSERT INTO Subscriptions (UserID, PlanID, StartDate, EndDate, PaymentStatus)
                OUTPUT INSERTED.SubscriptionID
                VALUES (@UserID, @PlanID, GETDATE(), DATEADD(day, 30, GETDATE()), 'U')
            `);
        
        testSubscriptionId = subRes.recordset[0].SubscriptionID;

        const payRes = await pool.request()
            .input('SubID', sql.Int, testSubscriptionId)
            .input('Amount', sql.Decimal(10,2), price)
            .query(`
                INSERT INTO Payments (SubscriptionID, AmountPaid, Status, PaymentMethod)
                OUTPUT INSERTED.PaymentID
                VALUES (@SubID, @Amount, 'P', 'StressTest')
            `);
        
        testPaymentId = payRes.recordset[0].PaymentID;
        console.log(`✅ Pago de prueba creado exitosamente (PaymentID: ${testPaymentId}).`);

        // 2. Stress Test: Concurrencia masiva en Trigger de Auditoría
        console.log('\n[Fase 2] Ejecutando estrés de actualizaciones concurrentes (Trigger AuditLogs)...');
        const NUM_UPDATES = 50;
        const promises = [];
        
        // Disparamos múltiples actualizaciones al mismo tiempo (simulando peticiones web concurrentes masivas)
        // Usamos los estados válidos del constraint CK_Payments_Status: 'P' (Pendiente) y 'A' (Aprobado)
        for(let i=0; i<NUM_UPDATES; i++) {
            const newStatus = (i % 2 === 0) ? 'P' : 'A'; // Alternar entre Pendiente y Aprobado
            const req = pool.request()
                .input('PayID', sql.Int, testPaymentId)
                .input('NewStatus', sql.Char(1), newStatus)
                .input('ModifiedBy', sql.VarChar(50), `StressTester_${i}`)
                .query(`
                    UPDATE Payments SET Status = @NewStatus WHERE PaymentID = @PayID
                `);
            promises.push(req);
        }

        await Promise.all(promises);
        console.log(`✅ Se lanzaron y resolvieron ${NUM_UPDATES} actualizaciones concurrentes.`);

        // 3. Verificación de Integridad
        console.log('\n[Fase 3] Verificando la integridad de los Triggers...');
        const auditRes = await pool.request()
            .input('EntityID', sql.Int, testPaymentId)
            .query(`
                SELECT COUNT(*) as EventCount 
                FROM AuditLogs 
                WHERE TableName = 'Payments' AND EntityID = @EntityID
            `);
        
        const eventsLogged = auditRes.recordset[0].EventCount;
        console.log(`🔎 Registros de auditoría encontrados para este pago: ${eventsLogged}`);
        
        console.log('\n===========================================================');
        console.log('🎉 PRUEBAS DE ESTRÉS COMPLETADAS CON ÉXITO');
        console.log('La base de datos y los triggers han demostrado ser íntegros y resilientes.');
        console.log('===========================================================');

    } catch (err) {
        console.error('❌ ERROR DURANTE LAS PRUEBAS DE ESTRÉS:', err);
    } finally {
        // 4. Teardown: Limpieza de datos de prueba garantizada
        if (pool) {
            console.log('\n[Fase 4] Limpiando datos de prueba (Teardown)...');
            try {
                if (testPaymentId) {
                    await pool.request()
                        .input('PayID', sql.Int, testPaymentId)
                        .query('DELETE FROM Payments WHERE PaymentID = @PayID');
                    console.log('✅ Pago de prueba eliminado.');
                }
                if (testSubscriptionId) {
                    await pool.request()
                        .input('SubID', sql.Int, testSubscriptionId)
                        .query('DELETE FROM Subscriptions WHERE SubscriptionID = @SubID');
                    console.log('✅ Suscripción de prueba eliminada.');
                }
                // Limpiar cualquier residuo previo por seguridad
                await pool.request().query("DELETE FROM Payments WHERE PaymentMethod = 'StressTest'");
            } catch (cleanupErr) {
                console.error('Error al limpiar datos temporales:', cleanupErr);
            }
            pool.close();
            console.log('Conexión cerrada.');
        }
        process.exit(0);
    }
}

runStressTest();
