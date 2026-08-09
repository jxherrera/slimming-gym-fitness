-- ==============================================================================
-- MIGRACIÓN: Unificación de Estados de Dominio
-- ==============================================================================

USE [GymDatabase];
GO

-- 1. Limpieza de datos sucios (en caso de existir)
-- Convertir cualquier 'Paid' a 'P' (Pendiente) ya que 'P' se maneja como pendiente de pago o validado
UPDATE Subscriptions SET PaymentStatus = 'P' WHERE PaymentStatus NOT IN ('P', 'U');
UPDATE Users SET Status = 'A' WHERE Status NOT IN ('A', 'I');
UPDATE Payments SET Status = 'P' WHERE Status NOT IN ('A', 'P', 'R');
GO

-- 2. Agregar Constraints
ALTER TABLE Users ADD CONSTRAINT CK_Users_Status CHECK (Status IN ('A','I'));
ALTER TABLE Subscriptions ADD CONSTRAINT CK_Subs_PaymentStatus CHECK (PaymentStatus IN ('P','U'));
ALTER TABLE Payments ADD CONSTRAINT CK_Payments_Status CHECK (Status IN ('A','P','R'));
GO

-- 3. Limpieza de URLs huérfanas en Google Cloud Storage (Bucket eliminado)
-- SELECT COUNT(*) FROM Payments WHERE ReceiptImageUrl LIKE 'https://storage.googleapis.com/%';
UPDATE Payments
SET ReceiptImageUrl = NULL
WHERE ReceiptImageUrl LIKE 'https://storage.googleapis.com/%';
GO
