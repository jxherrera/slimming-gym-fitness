# Base de Datos: Slimming Gym Fitness

Este directorio contiene la infraestructura de la base de datos SQL Server para el sistema.

## Orden de Ejecución para levantar desde cero

Si necesitas levantar el esquema desde cero en un nuevo entorno, debes ejecutar los scripts en el siguiente orden:

1. `schema/01_schema.sql` (Crea las tablas, índices, constraints)
2. `schema/02_stored_procedures.sql` (Crea procedimientos almacenados optimizados)
3. `migrations/*.sql` (Aplica las migraciones en orden alfabético si hay cambios posteriores)
4. `seeds/seed.sql` (Opcional, para poblar datos de prueba iniciales)

> [!IMPORTANT]
> `migrations/20260810_tablas_faltantes.sql` **no es opcional**. `01_schema.sql` define 9 tablas, pero la API consulta 21: las de clases, horarios, plantillas, evaluaciones y entrenamientos vivían solo en la base original y nunca se versionaron. Sin esa migración, la pantalla de horarios responde `Invalid object name 'CoachWorkHours'` y varias secciones devuelven error 500. Es idempotente, así que puede aplicarse sobre una base ya existente.

*Nota: El script `backend-gimnasio/seeders/seedRunner.js` puede estar configurado para correr estos archivos. Verifica las rutas en ese script si lo utilizas.*

## Datos de Demostración

Un gimnasio completo y verosímil: **4 entrenadores y 30 socios** con su operación de los últimos meses — suscripciones con historial de renovaciones, pagos aprobados y pendientes, asistencias, rutinas, plantillas, catálogo de ejercicios, clases grupales con reservas, evaluaciones físicas, notificaciones y bitácora de correos. **No crea administradores**: el único debe seguir siendo el superusuario maestro.

Requisito previo en ambos casos: los roles y los 3 planes base (`npm run seed` o `seeds/seed.sql`).

### En la VM — `seeds/demo_dataset.sql`

Script SQL autónomo, pensado para enviarse por SSH sin necesidad de Node ni del `.env`. El volumen `./backups` del `docker-compose.yml` ya está montado dentro del contenedor de la base como `/backups`:

```bash
scp database/seeds/demo_dataset.sql usuario@vm:/opt/slimming/backups/
```

Y en la VM:

```bash
cd /opt/slimming && docker compose exec -T db bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -d GymDatabase -f 65001 -i /backups/demo_dataset.sql'
```

`-f 65001` es necesario: sin él las tildes y las ñ llegan corruptas. El script es re-ejecutable (empieza borrando la carga anterior) y aborta sin escribir nada si faltan los roles o los planes. Para revertir, `demo_limpiar.sql` por la misma vía.

### En local — seeder de Node

```bash
cd backend-gimnasio
npm run seed:demo             # genera
npm run seed:demo:limpiar     # borra solo lo generado
```

### Regenerar el dataset

Las fechas son relativas al día de generación, así que conviene regenerarlo antes de una demostración para que "hoy" siga teniendo asistencias y clases próximas:

```bash
cd backend-gimnasio && npm run dataset:sql
```

El generador no reimplementa nada: ejecuta el mismo seeder contra un pool simulado y traduce los INSERT a SQL, de modo que el `.sql` y `npm run seed:demo` producen datos idénticos. En el `.sql` las llaves foráneas se resuelven por clave natural (correo, nombre del plan, fecha de inicio) y no por ID, así que funciona en cualquier base sin importar sus IDENTITY.

### Reversibilidad

Todas las cuentas usan el dominio `@demo.slimminggym.com` y la contraseña `Gimnasio2026`. Ese dominio es el único marcador que las distingue de los usuarios reales y es lo que permite borrarlas sin tocar producción. Los datos son deterministas: dos generaciones producen exactamente las mismas cifras. El catálogo de ejercicios no se borra al limpiar, porque es un dato maestro que los entrenadores también alimentan.

Los perfiles de socio y el resto de catálogos están en `backend-gimnasio/seeders/demoData.js`.

## Archivos y Documentación

- `DICCIONARIO_DATOS.md`: Contiene las reglas del dominio, restricciones de los estados y estructura de cada tabla.
- `README_INSTALACION_VM.md`: Guía para levantar el contenedor con Docker Compose y configurar la seguridad (Usuario con mínimos privilegios).
- `cloud_db_security_config.md`: Explicación de la arquitectura de seguridad y red para aislar la base de datos.

## Scripts de Mantenimiento

- `scripts/backup.sh`: Realiza un respaldo automatizado y lo encripta.
- `scripts/restaurar.sh`: Desencripta un respaldo y reconstruye la base de datos.
