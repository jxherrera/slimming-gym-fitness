# Despliegue en Máquina Virtual — Slimming Gym Fitness

Procedimiento reproducible para levantar el sistema completo en una única máquina
virtual Linux (Ubuntu Server 22.04 LTS o superior).

En esta arquitectura la VM aloja los tres componentes: **Nginx** como servidor web
y proxy inverso, la **API Node.js** gestionada por PM2, y la instancia de **SQL
Server**. La base de datos escucha únicamente en `localhost`, por lo que su puerto
no queda expuesto a la red.

```
Internet ──HTTPS──> Nginx :443
                      ├── /        → archivos estáticos del frontend (dist/)
                      └── /api     → proxy inverso a Node.js :5001
                                          └── SQL Server 127.0.0.1:1433
```

## Decisión de arquitectura: PM2 en lugar de contenedores

Se descartó Docker para el despliegue. El sistema es una única aplicación Node.js
junto a una base de datos, sin necesidad de orquestación ni escalado horizontal;
introducir una capa de contenedores añadiría complejidad operativa (redes, volúmenes,
construcción de imágenes) sin beneficio proporcional, y ninguno de los integrantes
del equipo la domina lo suficiente para depurarla bajo presión. PM2 ofrece lo que el
proyecto necesita: reinicio automático ante fallos, arranque con el sistema
operativo y acceso directo a los registros.

---

## 1. Requisitos previos

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw
```

Node.js 20 LTS desde el repositorio oficial de NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # debe reportar v20.x
```

PM2 de forma global:

```bash
sudo npm install -g pm2
```

## 2. Cortafuegos

Solo se abren SSH y HTTP/HTTPS. **El puerto 1433 de SQL Server y el 5001 de Node
nunca se exponen**: ambos se consumen desde dentro de la propia VM.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status verbose
```

## 3. Base de datos

La instalación de SQL Server, la creación del usuario de aplicación con permisos
mínimos y la restauración del respaldo están documentadas en
[`database/README_INSTALACION_VM.md`](../database/README_INSTALACION_VM.md).

Antes de continuar, verifica desde la VM que la base responde:

```bash
cd /var/www/slimming/backend-gimnasio && npm run diagnostico:db
```

## 4. Código fuente

```bash
sudo mkdir -p /var/www/slimming
sudo chown -R $USER:$USER /var/www/slimming
git clone https://github.com/jxherrera/slimming-gym-fitness.git /var/www/slimming
cd /var/www/slimming
```

## 5. Backend

```bash
cd /var/www/slimming/backend-gimnasio
npm ci --omit=dev
cp .env.example .env
```

Edita el `.env` con los valores reales. Tres puntos obligatorios:

- `DB_SERVER=localhost` — la base está en la misma máquina.
- `JWT_SECRET` — **el servidor se niega a arrancar sin esta variable**. Genérala con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- `ALLOWED_ORIGINS=https://tu-dominio.com` — el dominio real de la aplicación.

Protege el archivo para que solo el usuario propietario pueda leerlo:

```bash
chmod 600 .env
```

Verifica que las pruebas unitarias pasan y arranca con PM2:

```bash
npm test
pm2 start server.js --name slimming-api
pm2 save
pm2 startup          # ejecuta el comando que imprime, con sudo
```

> **Orden de arranque:** al reiniciar la VM, los servicios se inician en paralelo y
> SQL Server tarda más en estar disponible que Node. La API tolera esa situación:
> reintenta la conexión 5 veces con 5 segundos de espera (unos 25 segundos de
> margen) y **no termina el proceso si no lo logra**, para no provocar un ciclo de
> reinicios en PM2. Si agota los reintentos, la API sigue respondiendo y devuelve
> error 500 solo en las operaciones que necesitan la base; basta `pm2 restart`
> cuando la base esté disponible.

Comandos de operación habituales:

```bash
pm2 status                  # estado del proceso
pm2 logs slimming-api       # registros en vivo
pm2 restart slimming-api    # reiniciar tras un despliegue
pm2 monit                   # consumo de CPU y memoria
```

## 6. Frontend

El frontend se compila a archivos estáticos que sirve Nginx; no requiere un proceso
en ejecución.

```bash
cd /var/www/slimming/frontend-gimnasio
npm ci
```

Crea el archivo `.env.production` con una **ruta relativa**:

```
VITE_API_URL=/api
```

Esto es deliberado: al servirse el frontend y la API bajo el mismo dominio, el
navegador no realiza peticiones de origen cruzado, con lo que desaparece cualquier
problema de CORS y la compilación funciona en cualquier dominio o IP sin necesidad
de recompilar.

```bash
npm run build     # genera dist/
```

## 7. Nginx

```bash
sudo nano /etc/nginx/sites-available/slimming
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Registros separados para facilitar el diagnóstico
    access_log /var/log/nginx/slimming.access.log;
    error_log  /var/log/nginx/slimming.error.log;

    # Límite de subida: los comprobantes de pago aceptan hasta 5 MB en el backend
    client_max_body_size 6M;

    # Compresión de los archivos estáticos
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # --- Frontend compilado ---
    root /var/www/slimming/frontend-gimnasio/dist;
    index index.html;

    location / {
        # Indispensable para React Router: sin esta línea, recargar el navegador
        # en /admin/pagos devuelve 404 porque no existe un archivo en esa ruta.
        try_files $uri $uri/ /index.html;
    }

    # Los recursos con hash en el nombre se pueden cachear indefinidamente
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # --- API ---
    location /api/ {
        proxy_pass http://127.0.0.1:5001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

Activa el sitio, retira el predeterminado y recarga:

```bash
sudo ln -s /etc/nginx/sites-available/slimming /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t          # valida la sintaxis antes de aplicar
sudo systemctl reload nginx
```

## 8. HTTPS

El sistema maneja datos personales y contraseñas: **HTTPS no es opcional**.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

Certbot modifica la configuración de Nginx para redirigir HTTP a HTTPS e instala una
tarea de renovación automática. Verifícala con:

```bash
sudo certbot renew --dry-run
```

---

## 9. Verificación posterior al despliegue

| # | Comprobación | Resultado esperado |
|---|---|---|
| 1 | `pm2 status` | `slimming-api` en estado `online` |
| 2 | `curl -i http://127.0.0.1:5001/api/plans` | `200` con la lista de planes |
| 3 | `curl -i https://tu-dominio.com/api/users/1` | `401` (sin token, correcto) |
| 4 | Abrir `https://tu-dominio.com` | La landing carga los planes desde la API |
| 5 | Iniciar sesión y recargar en `/admin/pagos` | La página carga, **no** un 404 |
| 6 | `sudo ufw status` | 1433 y 5001 ausentes de la lista |
| 7 | Reiniciar la VM y repetir el paso 1 | El proceso vuelve a levantar solo |

El paso 5 es el que suele fallar: si devuelve 404, falta la línea `try_files` del
bloque `location /`.

## 10. Actualización de la aplicación

```bash
cd /var/www/slimming
git pull origin main

cd backend-gimnasio && npm ci --omit=dev && npm test
pm2 restart slimming-api

cd ../frontend-gimnasio && npm ci && npm run build
```

El frontend no requiere reinicio: Nginx sirve los archivos nuevos de inmediato.

## 11. Diagnóstico de fallos frecuentes

| Síntoma | Causa probable | Verificación |
|---|---|---|
| La API no arranca y el log dice `FATAL: JWT_SECRET` | Falta la variable en el `.env` | `grep JWT_SECRET .env` |
| `502 Bad Gateway` en `/api` | El proceso de Node está caído | `pm2 status` y `pm2 logs slimming-api` |
| `404` al recargar una ruta interna | Falta `try_files` en Nginx | `sudo nginx -T \| grep try_files` |
| Peticiones bloqueadas por CORS | `ALLOWED_ORIGINS` no incluye el dominio | `grep ALLOWED_ORIGINS .env` |
| `ETIMEOUT` al conectar a la base | SQL Server detenido o `DB_SERVER` incorrecto | `npm run diagnostico:db` |
| `500` en operaciones con datos, pero la API responde | La conexión a la base agotó sus 5 reintentos | `pm2 logs slimming-api` y luego `pm2 restart slimming-api` |
| Los correos no salen | Credenciales SMTP inválidas | `npm run probar:correo -- tu@correo.com` |

## 12. Respaldos

El respaldo de la base de datos es responsabilidad del script documentado en
`database/scripts/backup.sh`, ejecutado por `cron` a diario.

> **Importante:** en la nube los respaldos eran automáticos; en una VM propia no
> existe ningún mecanismo que los realice por sí solo. Sin esa tarea programada, un
> fallo del disco supone la pérdida total de la información del sistema.

Verifica que la tarea está activa con `crontab -l`, y **prueba una restauración al
menos una vez**: un respaldo que nunca se ha restaurado no es un respaldo comprobado.
