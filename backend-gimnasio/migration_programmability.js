const { sql, poolPromise } = require('./config/db');

async function migrate() {
    try {
        const pool = await poolPromise;
        
        console.log("Creating/Updating vw_DashboardStats View...");
        try {
            await pool.request().query(`
                CREATE OR ALTER VIEW dbo.vw_DashboardStats AS
                SELECT 
                    (SELECT COUNT(UserID) FROM dbo.Users WHERE Status = 'A') AS TotalActiveUsers,
                    (SELECT ISNULL(SUM(AmountPaid), 0) FROM dbo.Payments WHERE Status = 'A') AS TotalApprovedRevenue;
            `);
            console.log("View vw_DashboardStats created/updated.");
        } catch (e) {
            console.log("Error with vw_DashboardStats:", e.message);
        }

        console.log("Creating/Updating trg_PreventPlanDelete Trigger...");
        try {
            await pool.request().query(`
                CREATE OR ALTER TRIGGER dbo.trg_PreventPlanDelete
                ON dbo.Plans
                INSTEAD OF DELETE
                AS
                BEGIN
                    IF EXISTS (SELECT 1 FROM dbo.Subscriptions S INNER JOIN deleted d ON S.PlanID = d.PlanID)
                    BEGIN
                        UPDATE dbo.Plans
                        SET Status = 'I'
                        WHERE PlanID IN (SELECT PlanID FROM deleted);
                        
                        PRINT 'El plan tiene suscripciones registradas. Se ha cambiado su estado a Inactivo (I).';
                    END
                    ELSE
                    BEGIN
                        DELETE FROM dbo.Plans WHERE PlanID IN (SELECT PlanID FROM deleted);
                    END
                END;
            `);
            console.log("Trigger trg_PreventPlanDelete created/updated.");
        } catch (e) {
            console.log("Error with trg_PreventPlanDelete:", e.message);
        }

        console.log("Programmability Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
