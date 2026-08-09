# Seguridad de Base de Datos en la Nube / Entorno de Producción

## Arquitectura de Seguridad (Actualizado)

Anteriormente se consideraba utilizar Google Cloud SQL, Azure SQL o AWS RDS con reglas de Firewall y listas blancas de IPs. Sin embargo, la arquitectura actual basada en **Docker Compose sobre VM Linux** proporciona una postura de seguridad superior si se configura correctamente.

### 1. Aislamiento de Red (El Puerto 1433 NO se publica)
A diferencia de servicios gestionados que exponen el puerto a internet (requiriendo listas blancas), nuestra instancia de SQL Server en Docker **no publica el puerto 1433 hacia el host externo**. 
La base de datos es accesible única y exclusivamente a través de la red interna puente (`bridge` network) de Docker. El contenedor `backend` se conecta usando el DNS interno de Docker (nombre del servicio `db`).

- *Beneficio:* Es imposible realizar ataques de fuerza bruta externos o escaneos de puertos (ej. Nmap) sobre la base de datos, porque sencillamente no existe a nivel de red pública.

### 2. Principio de Menor Privilegio (Usuario `slimming_app`)
El backend no posee las credenciales de administración (`sa`). Se ha creado el login `slimming_app` con membresía únicamente a los roles `db_datareader` y `db_datawriter`, además de permisos explícitos para ejecutar Stored Procedures (`GRANT EXECUTE`).
- *Beneficio:* Si la aplicación backend sufriera de alguna vulnerabilidad (ej. SQL Injection), el atacante no podría extraer hashes de otros usuarios de sistema ni modificar la estructura de las tablas, previniendo secuestros o destrucción masiva (`DROP DATABASE`).

### 3. Cifrado de Respaldos (AES-256)
Dado que los respaldos en la nube almacenan PII (Personal Identifiable Information) como correos, cédulas e historiales, el script `backup.sh` encripta cada `.bak` usando OpenSSL (`aes-256-cbc`) antes de que este pueda ser transportado o subido a un bucket de almacenamiento externo.
- *Beneficio:* Resiliencia ante exfiltración. Si el almacenamiento de respaldos fuera vulnerado, los archivos serían ilegibles sin la llave criptográfica inyectada en el servidor de producción.
