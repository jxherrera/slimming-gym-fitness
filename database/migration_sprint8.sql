-- ==============================================================================
-- MIGRACIÓN SPRINT 8 (Ariel - Administración de BD y Arquitectura)
-- Funcionalidad: Procedimientos Almacenados de Alto Rendimiento para la Web
-- ==============================================================================

USE [GymDatabase];
GO

-- 1. Crear Stored Procedure para Consultar Planes Públicos
-- Eliminar el procedimiento si ya existe
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetPublicPlans')
BEGIN
    DROP PROCEDURE sp_GetPublicPlans;
END
GO

-- Crear el procedimiento
CREATE PROCEDURE sp_GetPublicPlans
AS
BEGIN
    -- Configurar opciones para mejorar rendimiento
    SET NOCOUNT ON;
    
    -- Consultar solo planes activos ('A') ordenados por precio
    -- Limitamos las columnas a las estrictamente necesarias para la interfaz pública
    SELECT 
        PlanID,
        PlanName,
        Price,
        DurationDays
    FROM 
        Plans
    WHERE 
        Status = 'A'
    ORDER BY 
        Price ASC;
END
GO
