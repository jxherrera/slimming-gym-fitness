-- ==============================================================================
-- MIGRACIÓN: Tabla de Recuperación de Contraseña
-- ==============================================================================

USE [GymDatabase];
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PasswordResetTokens')
BEGIN
    CREATE TABLE PasswordResetTokens (
        TokenID    INT PRIMARY KEY IDENTITY(1,1),
        UserID     INT NOT NULL,
        -- NOTA DE SEGURIDAD: Se guarda un Hash (SHA-256) del token y nunca el token en texto plano.
        -- Así, en caso de vulneración de la tabla, los atacantes no pueden usar los tokens activos.
        TokenHash  VARCHAR(255) NOT NULL,   
        ExpiresAt  DATETIME NOT NULL,
        UsedAt     DATETIME NULL,
        CreatedAt  DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserID)
            REFERENCES Users(UserID) ON DELETE CASCADE
    );

    CREATE INDEX IX_PasswordResetTokens_TokenHash ON PasswordResetTokens(TokenHash);
END
GO
