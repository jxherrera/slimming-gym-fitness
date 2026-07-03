INSERT INTO dbo.Roles (RoleName)
VALUES ('Guest'),  -- RoleID = 1
       ('Admin'),  -- RoleID = 2
       ('Member'), -- RoleID = 3
       ('Coach');  -- RoleID = 4

INSERT INTO dbo.Users (
    IDNumber, FirstName, LastName, Email, PasswordHash, PhoneNumber, RoleID, Status, CreatedAt
)
VALUES 
    (
        '0000000000', 'admin', 'admin', 'admin@admin.com',
        '$2b$10$lLp0rtXG6r/HL3vx1oRlJu71Jwcv/pR7ZFG/sfuDXFHifERmBmt52',
        '0000000000', 2, 'A', '2026-06-14 21:58:17.597'
    ),
    (
        '1700000000', 'Ariel', 'Rueda', 'coach.coach@slimming.com',
        '$2b$10$lLp0rtXG6r/HL3vx1oRlJu71Jwcv/pR7ZFG/sfuDXFHifERmBmt52',
        '0999999999', 4, 'A', GETDATE()
    ),
    (
        '0999999991', 'Juan', 'Perez', 'cliente1@ejemplo.com',
        '$2b$10$lLp0rtXG6r/HL3vx1oRlJu71Jwcv/pR7ZFG/sfuDXFHifERmBmt52',
        '0988888888', 3, 'A', GETDATE()
    ),
    (
        '0999999992', 'Maria', 'Gomez', 'cliente2@ejemplo.com',
        '$2b$10$lLp0rtXG6r/HL3vx1oRlJu71Jwcv/pR7ZFG/sfuDXFHifERmBmt52',
        '0977777777', 3, 'A', GETDATE()
    );

INSERT INTO dbo.Routines (UserID, CoachID, Goal)
VALUES 
    (3, 2, 'Hipertrofia - Nivel Principiante'),
    (4, 2, 'Pérdida de peso - Acondicionamiento base');


SELECT * FROM dbo.Roles;
SELECT * FROM dbo.Users;
SELECT * FROM dbo.Routines;