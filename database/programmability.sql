CREATE OR ALTER VIEW dbo.vw_DashboardStats AS
SELECT 
    (SELECT COUNT(UserID) FROM dbo.Users WHERE Status = 'A') AS TotalActiveUsers,
    (SELECT ISNULL(SUM(AmountPaid), 0) FROM dbo.Payments WHERE Status = 'A') AS TotalApprovedRevenue;
GO

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
GO