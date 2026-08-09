# Instalación y Configuración del Servidor (Docker y SQL Server)

## 1. Servicio Base de Datos en `docker-compose.yml`
Josue, por favor incluye este servicio en el archivo `docker-compose.yml` para desplegar SQL Server de manera persistente y segura en la VM de producción. 

Es vital que **no se publique el puerto 1433 hacia el exterior** (`ports: ["1433:1433"]`) a menos que sea estrictamente necesario para mantenimiento mediante un túnel SSH, en cuyo caso usar `127.0.0.1:1433:1433`. El backend debe conectarse internamente usando el host `db`.

```yaml
services:
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: slimming_db
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_PID=Express
      - MSSQL_SA_PASSWORD=${MSSQL_SA_PASSWORD}
    volumes:
      - sqldata:/var/opt/mssql
      - /var/backups/slimming:/backups
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \"$$MSSQL_SA_PASSWORD\" -C -Q 'SELECT 1' || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 10
      start_period: 60s
    restart: unless-stopped
    # platform: linux/amd64 # Habilitar solo si desarrollas en Mac Apple Silicon (M1/M2)

volumes:
  sqldata:
```

## 2. Creación del Usuario de Aplicación (Mínimos Privilegios)
Una vez que la base de datos `GymDatabase` está creada (corriendo los scripts del directorio `schema/` y `migrations/`), es necesario crear un usuario con permisos limitados. El Backend (Node.js) **no debe conectarse con el usuario `sa`**.

Ejecuta el siguiente script en SQL Server conectado como administrador (`sa`):

```sql
USE [GymDatabase];
GO

CREATE LOGIN slimming_app WITH PASSWORD = '<CONTRASEÑA_FUERTE_AQUI>';
CREATE USER slimming_app FOR LOGIN slimming_app;

-- Dar permisos para leer y escribir datos
ALTER ROLE db_datareader ADD MEMBER slimming_app;
ALTER ROLE db_datawriter ADD MEMBER slimming_app;

-- Dar permisos para ejecutar Stored Procedures (ej. sp_GetPublicPlans)
GRANT EXECUTE ON SCHEMA::dbo TO slimming_app;
GO
```

Con este usuario, si el Backend llega a ser vulnerado mediante SQL Injection, el atacante no podrá ejecutar comandos destructivos de esquema como `DROP TABLE`.

## 3. Respaldos y Restauración
- En el servidor host, asegúrate de que el directorio `/var/backups/slimming` exista y tenga permisos de escritura.
- Para realizar un respaldo, ejecuta el script `scripts/backup.sh` (puede añadirse al `cron` de Linux para ejecutarse diariamente). Este script encripta el respaldo usando la clave en `$BACKUP_ENCRYPTION_KEY`.
- Para restaurar desde cero, usa `scripts/restaurar.sh`.
