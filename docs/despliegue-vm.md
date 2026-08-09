# Despliegue en Máquina Virtual — Slimming Gym Fitness

Procedimiento reproducible para levantar el sistema completo con **Docker Compose**
sobre una máquina virtual Linux (Ubuntu Server 22.04 LTS o superior).

## 1. Arquitectura

```
                        Internet
                           │
                      HTTPS │ 443
                           ▼
        ┌──────────────────────────────────────────┐
        │  proxy  (Nginx)                          │
        │   /         → frontend compilado         │
        │   /uploads  → volumen de comprobantes    │
        │   /api      → balanceo entre réplicas    │
        └───────────────────┬──────────────────────┘
                            │  round-robin
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          ┌───────┐     ┌───────┐     ┌───────┐      ┌──────────┐
          │ api 1 │     │ api 2 │     │ api 3 │      │  worker  │
          └───┬───┘     └───┬───┘     └───┬───┘      └────┬─────┘
              └─────────────┼─────────────┴───────────────┘
                            ▼
                     ┌─────────────┐
                     │  db (SQL)   │
                     └─────────────┘

Volúmenes persistentes:
  sqldata  → /var/opt/mssql   (base de datos)
  uploads  → /app/uploads     (comprobantes de pago, compartido)
```

| Servicio | Réplicas | Publica puertos | Tareas programadas |
|---|---|---|---|
| `proxy` | 1 | 80, 443 | — |
| `api` | 1 a N (escalable) | ninguno | **no** |
| `worker` | 1 (fija) | ninguno | **sí** |
| `db` | 1 | ninguno | — |

### Por qué contenedores

Se optó por Docker Compose frente a la ejecución nativa con un gestor de procesos
por cuatro razones:

1. **Entorno idéntico** en las máquinas de los tres desarrolladores y en el
   servidor. Elimina la clase de fallo "en mi equipo funciona", que en este
   proyecto ya se manifestó: el script de pruebas dependía de una expansión de
   patrones que existe en Node 22 pero no en Node 20.
2. **Despliegue en un comando**, con las versiones de Node y SQL Server fijadas
   en la definición y no en el estado del servidor.
3. **Aislamiento**: la API corre como usuario sin privilegios dentro del
   contenedor, y la base de datos no expone su puerto a la red.
4. **Escalado horizontal de la capa de aplicación**, aprovechando que la API no
   guarda estado en memoria.

### Sobre el balanceo de carga

El `proxy` reparte las peticiones entre las réplicas del servicio `api` mediante
resolución DNS con round-robin. Esto proporciona reparto de carga entre procesos,
despliegues sin interrupción del servicio y aislamiento de fallos por réplica: si
una réplica deja de responder, Nginx reintenta la petición en otra.

**No constituye alta disponibilidad.** Todas las réplicas comparten la misma
máquina virtual, que sigue siendo un punto único de fallo: si la VM cae, el
sistema completo queda fuera de servicio. La evolución natural de esta
arquitectura sería replicar la aplicación en varias máquinas virtuales tras un
balanceador externo, y separar la base de datos en una instancia dedicada con
replicación.

Un detalle de diseño que hace posible el escalado: **la autenticación se basa en
JSON Web Tokens sin estado**, por lo que cualquier réplica puede validar cualquier
petición sin consultar un almacén de sesiones. Con sesiones del lado del servidor
habría sido necesario introducir afinidad de sesión en el balanceador o un
almacén compartido como Redis.

---

## 2. Requisitos e instalación de Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl git gnupg ufw
```

Docker Engine y el plugin Compose desde el repositorio oficial:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Permite usar Docker sin `sudo` (requiere cerrar y reabrir la sesión):

```bash
sudo usermod -aG docker $USER
```

Verifica:
```bash
docker --version && docker compose version
```

**Requisitos de memoria:** SQL Server exige un mínimo de 2 GB de RAM solo para su
proceso. La VM debería tener al menos 4 GB para alojar además el proxy y varias
réplicas de la API.

## 3. Cortafuegos

Solo SSH y HTTP/HTTPS. **Los puertos 1433 (base de datos) y 5001 (API) nunca se
publican**: se consumen desde la red interna de Docker.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

> Docker manipula `iptables` directamente y puede sortear las reglas de `ufw` si
> un servicio publica un puerto. Por eso el `docker-compose.yml` deja sin
> publicar los puertos de `db` y `api`: es la defensa efectiva, no el cortafuegos.

## 4. Código y configuración

```bash
sudo mkdir -p /opt/slimming && sudo chown -R $USER:$USER /opt/slimming
git clone https://github.com/jxherrera/slimming-gym-fitness.git /opt/slimming
cd /opt/slimming
cp .env.example .env
```

Completa el `.env` de la raíz. Tres valores son obligatorios y el sistema no
arranca sin ellos:

```bash
# Genera cada secreto por separado
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

- `MSSQL_SA_PASSWORD` — contraseña del contenedor de base de datos.
- `DB_PASSWORD` — credencial con la que se conecta la API. En producción debe ser
  un usuario de aplicación con permisos mínimos, nunca `sa`
  (ver `database/README_INSTALACION_VM.md`).
- `JWT_SECRET` — **la API se niega a arrancar si falta o mide menos de 32
  caracteres.** Es intencional: evita que vuelva a colarse una clave por defecto.

Protege el archivo:
```bash
chmod 600 .env
```

## 5. Puesta en marcha

```bash
docker compose up -d --build
docker compose ps
```

El primer arranque tarda unos minutos: descarga la imagen de SQL Server (~1,5 GB)
y compila las dos imágenes propias. El servicio `api` espera a que `db` reporte
estado sano antes de iniciar.

Restaura la base de datos siguiendo `database/README_INSTALACION_VM.md`, y
verifica:

```bash
curl -s localhost/api/health | jq
```

Debe devolver `status: "ok"` y `database: "ok"`.

### Escalar la API

```bash
docker compose up -d --scale api=3
```

Comprueba que el balanceo reparte de verdad:

```bash
for i in $(seq 1 9); do curl -s localhost/api/health/live | grep -o '"instance":"[^"]*"'; done
```

Deben aparecer tres identificadores de contenedor distintos, alternándose. Si
sale siempre el mismo, falta la directiva `resolver` o la variable en
`proxy_pass` de `frontend-gimnasio/nginx.conf`.

> **No escales `worker`.** Es el único proceso con las tareas programadas
> activas: con dos instancias, cada socio recibiría dos avisos de vencimiento.

## 6. HTTPS

El sistema maneja datos personales y contraseñas: HTTPS no es opcional.

```bash
sudo apt install -y certbot
docker compose stop proxy                       # libera el puerto 80
sudo certbot certonly --standalone -d tu-dominio.com -d www.tu-dominio.com
```

Añade el montaje de los certificados al servicio `proxy` del
`docker-compose.yml`:

```yaml
    volumes:
      - uploads:/app/uploads:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

Descomenta el bloque `listen 443 ssl` de `frontend-gimnasio/nginx.conf`,
sustituye el dominio, y levanta de nuevo:

```bash
docker compose up -d --build proxy
```

Para que la renovación automática recargue el certificado, crea un enlace de
despliegue en `/etc/letsencrypt/renewal-hooks/deploy/slimming.sh`:

```bash
#!/bin/sh
cd /opt/slimming && docker compose restart proxy
```
Hazlo ejecutable con `chmod +x` y valida la renovación con
`sudo certbot renew --dry-run`.

---

## 7. Persistencia de datos

Es la parte más importante de este documento.

| Volumen | Contenido | Consecuencia de perderlo |
|---|---|---|
| `sqldata` | Base de datos completa: usuarios, suscripciones, pagos, rutinas | Pérdida total del sistema |
| `uploads` | Comprobantes de pago subidos por los socios | Pérdida de la evidencia de los pagos |

```bash
docker volume ls | grep slimming
docker volume inspect slimming_sqldata
```

Los volúmenes son independientes del ciclo de vida de los contenedores:
`docker compose down`, `up`, `build` y `restart` **no** los afectan.

> ### ⚠️ El comando que destruye el proyecto
>
> ```
> docker compose down -v
> ```
>
> La opción `-v` **elimina los volúmenes**: borra la base de datos completa y
> todos los comprobantes de pago, de forma irreversible. Para detener el sistema
> se usa `docker compose down` **sin** `-v`. No ejecutes `down -v` en la VM de
> producción bajo ninguna circunstancia.

Los respaldos se guardan en `./backups`, que es un montaje al disco del host
(no un volumen): sobreviven incluso a la eliminación de los volúmenes. El script
que los genera y los cifra está en `database/scripts/backup.sh`; verifica que su
tarea de `cron` está activa con `crontab -l`.

**Prueba una restauración al menos una vez.** Un respaldo que nunca se ha
restaurado no es un respaldo comprobado, es una suposición.

## 8. Actualización sin interrupción del servicio

```bash
cd /opt/slimming
git pull origin main

# Reconstruye la imagen de la API y sustituye las replicas por tandas
docker compose build api
docker compose up -d --no-deps --scale api=3 api

# El frontend se recompila dentro de su imagen
docker compose up -d --build proxy
```

Verifica antes de dar por bueno el despliegue:
```bash
docker compose run --rm api npm test     # las pruebas, contra la imagen real
curl -s localhost/api/health | jq
```

## 9. Desarrollo local

En un Mac con Apple Silicon (arm64), la imagen oficial de SQL Server **no tiene
compilación nativa**: hay que descomentar `platform: linux/amd64` en el servicio
`db` del `docker-compose.yml`. Funciona mediante emulación, pero consume unos
2 GB de RAM y es notablemente más lenta. En la VM x86_64 corre nativo.

Alternativa más ágil para el día a día: levantar solo `db` en Docker y ejecutar la
API con `npm start` desde `backend-gimnasio` y el frontend con `npm run dev`. En
ese modo `ENABLE_CRON` va en `true` (hay una sola instancia) y `vite.config.js`
ya incluye el proxy de `/api` y `/uploads` hacia el puerto 5001.

---

## 10. Verificación posterior al despliegue

| # | Comprobación | Resultado esperado |
|---|---|---|
| 1 | `docker compose ps` | Los cuatro servicios en `running`, `db` en `healthy` |
| 2 | `curl -s localhost/api/health` | `200` con `status: ok` y `database: ok` |
| 3 | `curl -i localhost/api/users/1` | `401`: sin token, correcto |
| 4 | Abrir `https://tu-dominio.com` | La landing carga los planes desde la API |
| 5 | Iniciar sesión y recargar en `/admin/pagos` | La página carga; **no** un 404 |
| 6 | Escalar a 3 y consultar `/api/health/live` nueve veces | Tres instancias alternándose |
| 7 | `docker compose logs api \| grep -c "programadas activadas"` | `0` |
| 8 | `docker compose logs worker \| grep -c "programadas activadas"` | `1` |
| 9 | Subir un comprobante y `docker compose restart api` | El comprobante sigue visible |
| 10 | `docker compose down && docker compose up -d` | Todos los datos siguen ahí |
| 11 | `sudo ufw status` | 1433 y 5001 ausentes de la lista |
| 12 | Reiniciar la VM y repetir el paso 1 | Los servicios levantan solos |

Los pasos 5 y 6 son los que suelen fallar: el 5 por falta de `try_files` en la
configuración de Nginx, el 6 por falta del `resolver`.

## 11. Diagnóstico de fallos frecuentes

| Síntoma | Causa probable | Verificación |
|---|---|---|
| `api` reinicia en bucle y el log dice `FATAL: JWT_SECRET` | Falta la variable en el `.env` de la raíz | `grep JWT_SECRET .env` |
| `api` no arranca nunca | `db` no llega a estado sano | `docker inspect --format='{{.State.Health.Status}}' slimming-db` |
| `502 Bad Gateway` en `/api` | Ninguna réplica responde | `docker compose ps` y `docker compose logs api` |
| `404` al recargar una ruta interna | Falta `try_files` en `nginx.conf` | `docker compose exec proxy nginx -T \| grep try_files` |
| El balanceo siempre responde con la misma instancia | Falta `resolver` o la variable en `proxy_pass` | `docker compose exec proxy nginx -T \| grep resolver` |
| Imágenes de comprobantes roto de forma intermitente | El volumen `uploads` no es compartido entre réplicas | `docker compose config \| grep -A3 volumes` |
| Correos de vencimiento duplicados | `ENABLE_CRON` en `true` en las réplicas de `api` | `docker compose exec api printenv ENABLE_CRON` |
| `/api/health` responde `503 degraded` | La base no responde, pero la API está viva | `docker compose logs db` |
| Peticiones bloqueadas por CORS | `ALLOWED_ORIGINS` no incluye el dominio | `docker compose exec api printenv ALLOWED_ORIGINS` |
| Los correos no salen | Credenciales SMTP inválidas | `docker compose exec api npm run probar:correo -- tu@correo.com` |

Comandos de operación habituales:

```bash
docker compose ps                     # estado de los servicios
docker compose logs -f api            # registros en vivo
docker compose logs --tail=50 worker  # ultimas lineas del worker
docker compose exec api sh            # shell dentro de una replica
docker stats                          # consumo de CPU y memoria
```
