# Diccionario de Datos - Slimming Gym Fitness

Este documento define la estructura de las tablas de la base de datos `GymDatabase` para el sistema Slimming Gym Fitness, detallando los dominios permitidos para cada campo.

## 1. Users
Almacena todos los usuarios del sistema (Socio, Coach, Administrador).

| Columna | Tipo | Nulable | Dominio/Reglas | Descripción |
|---------|------|---------|----------------|-------------|
| UserID | INT | No | IDENTITY(1,1), PK | Identificador único del usuario. |
| IDNumber | VARCHAR(15) | No | UNIQUE | Número de identificación (Cédula o Pasaporte). |
| FirstName | VARCHAR(100) | No | | Nombre del usuario. |
| LastName | VARCHAR(100) | No | | Apellido del usuario. |
| Email | VARCHAR(150) | No | UNIQUE | Correo electrónico de acceso. |
| PasswordHash | VARCHAR(255) | No | | Hash encriptado de la contraseña (bcrypt/Argon2). |
| PhoneNumber | VARCHAR(20) | Sí | | Teléfono de contacto. |
| RoleID | INT | Sí | FK (Roles.RoleID) | Nivel de acceso del usuario. |
| Status | CHAR(1) | No | `'A'` (Activo), `'I'` (Inactivo) | Estado lógico de la cuenta. Validado por CHECK constraint. |
| CreatedAt | DATETIME | No | DEFAULT GETDATE() | Fecha de registro en el sistema. |

## 2. Subscriptions
Almacena la relación entre un socio (User) y un plan contratado.

| Columna | Tipo | Nulable | Dominio/Reglas | Descripción |
|---------|------|---------|----------------|-------------|
| SubscriptionID | INT | No | IDENTITY(1,1), PK | Identificador único de suscripción. |
| UserID | INT | Sí | FK (Users.UserID) | Usuario que contrata el plan. |
| PlanID | INT | Sí | FK (Plans.PlanID) | Plan adquirido. |
| StartDate | DATE | No | | Fecha de inicio de la membresía. |
| EndDate | DATE | No | | Fecha de fin/vencimiento. |
| PaymentStatus | CHAR(1) | No | `'P'` (Pendiente), `'U'` (Unpaid/Sin Pagar) | Indica si la suscripción está vigente por un pago o pendiente. Validado por CHECK constraint. |

## 3. Payments
Registra los abonos contables de las suscripciones.

| Columna | Tipo | Nulable | Dominio/Reglas | Descripción |
|---------|------|---------|----------------|-------------|
| PaymentID | INT | No | IDENTITY(1,1), PK | ID del pago. |
| SubscriptionID | INT | Sí | FK (Subscriptions) | Suscripción que abona este pago. |
| AmountPaid | DECIMAL(10,2) | No | | Monto exacto pagado. |
| PaymentDate | DATETIME | No | DEFAULT GETDATE() | Momento de registro del pago. |
| PaymentMethod | VARCHAR(50) | Sí | Efectivo, Transferencia | Método de transacción. |
| ReferenceNumber | VARCHAR(100)| Sí | | Número de comprobante de la transferencia. |
| ReceiptImageUrl | VARCHAR(500)| Sí | | URL del comprobante. NOTA: Ya no usa Google Storage. |
| Status | CHAR(1) | No | `'A'` (Aprobado), `'P'` (Pendiente), `'R'` (Rechazado) | Estado de auditoría del pago. Validado por CHECK constraint. |

## 4. PasswordResetTokens
Administra los tokens seguros temporales para restaurar contraseñas.

| Columna | Tipo | Nulable | Dominio/Reglas | Descripción |
|---------|------|---------|----------------|-------------|
| TokenID | INT | No | IDENTITY(1,1), PK | ID del token. |
| UserID | INT | No | FK (Users) ON DELETE CASCADE | Usuario solicitante. |
| TokenHash | VARCHAR(255) | No | | Hash SHA-256 del token para evitar filtraciones directas. |
| ExpiresAt | DATETIME | No | | Fecha y hora límite de uso (generalmente 1 hora). |
| UsedAt | DATETIME | Sí | | Cuándo fue utilizado. |
| CreatedAt | DATETIME | No | DEFAULT GETDATE() | Momento de solicitud. |
