SELECT * FROM dbo.Users
SELECT * FROM dbo.Roles

INSERT INTO Roles (RoleName)
VALUES ('Guest'),
       ('Admin');

UPDATE Users
SET RoleID = 3
WHERE UserID = 12;

