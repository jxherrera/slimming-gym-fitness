# Guía de Conexión Privada y Seguridad de Base de Datos en la Nube

Para garantizar que la Base de Datos del sistema **Slimming Gym Fitness** esté completamente blindada en la nube y únicamente acepte conexiones originadas desde el servidor Backend en Node.js, se deben aplicar las siguientes políticas y configuraciones de red.

---

## 1. Restricciones de Cortafuegos e IP (Firewall & IP Whitelisting)

### Regla Principal:
- **Bloqueo Total por Defecto (Deny All)**: La base de datos NO debe responder a peticiones desde la red pública global (`0.0.0.0/0`).
- **Permiso Estricto por IP**: Solamente la IP pública o privada estática del servidor donde corre el backend (ejemplo Cloud Run Static Egress IP, Azure App Service Outbound IP, o AWS EC2 Elastic IP) tiene autorización en el Firewall en el puerto `1433`.

### Configuración por Proveedor Cloud:

#### A. Google Cloud Platform (Cloud SQL / Compute Engine)
1. Ir a **Cloud SQL** > Seleccionar Instancia > **Conexiones**.
2. Desactivar "IP Pública" si se utiliza **VPC Peering** o **Private Service Connect**.
3. Si requiere IP Pública, agregar en **Redes Autorizadas** únicamente la IP de Egress del Backend:
   ```
   Nombre: Backend-Node-Server
   Red/CIDR: [IP_DEL_BACKEND]/32
   ```

#### B. Azure SQL Database
1. Ir al recurso **SQL Server** en el portal de Azure > **Redes (Networking)**.
2. Establecer **Acceso a la red pública**: `Desactivado` o `Redes seleccionadas`.
3. En la regla de firewall agregada:
   - Nombre de Regla: `BackendOnly`
   - IP de Inicio: `[IP_DEL_BACKEND]`
   - IP de Fin: `[IP_DEL_BACKEND]`
4. Desactivar la opción *"Permitir que los servicios de Azure accedan al servidor"* si no están en el mismo grupo de recursos.

#### C. AWS RDS (SQL Server)
1. Ir a **RDS** > Instancias de base de datos > Editar.
2. Establecer `Accesible públicamente`: **No**.
3. Asignar un **Security Group** con la siguiente regla de Inbound (Entrada):
   - Type: `MS SQL` (Puerto 1433)
   - Source: `Custom` > `[IP_DEL_BACKEND]/32` o el ID del Security Group de la aplicación Node.js (`sg-xxxxxx`).

---

## 2. Encriptación de Tráfico SSL/TLS (In Transit Encryption)

La conexión entre Node.js y SQL Server debe exigir transporte cifrado mediante TLS/SSL.

En el backend (`config/db.js`), la configuración debe requerir encriptación activa:

```javascript
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Forzar uso de encriptación TLS/SSL
    trustServerCertificate: false // Exigir validación del certificado CA de la nube
  }
};
```

---

## 3. Túnel de Seguridad Cloud SQL Proxy / Private Endpoint (Recomendado para Producción)

Para eliminar por completo la exposición a Internet:

1. **Cloud SQL Auth Proxy (GCP)**:
   - Se ejecuta el proxy localmente junto al backend Node.js.
   - Node.js se conecta a `127.0.0.1:1433` a través de un túnel cifrado IAM sin exponer puertos abiertos en Internet.
   - Comando de arranque del Proxy:
     ```bash
     ./cloud-sql-proxy --address 0.0.0.0 --port 1433 [PROJECT-ID]:[REGION]:[INSTANCE-NAME]
     ```

2. **Azure Private Endpoint**:
   - Crear una interfaz de red privada dentro del VNet de la aplicación Node.js.
   - Asignar una IP privada interna (ej: `10.0.1.5`).

---

## 4. Matriz de Comprobación de Seguridad (Audit Checklist)

- [x] La base de datos rechaza conexiones desde la IP de un desarrollador no autorizado.
- [x] El puerto `1433` únicamente responde a la IP autorizada del backend.
- [x] La contraseña del superusuario `DB_PASSWORD` utiliza caracteres especiales y más de 16 caracteres.
- [x] El tráfico viaja encriptado vía SSL (`encrypt: true`).
