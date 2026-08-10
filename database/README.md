# Base de Datos: Slimming Gym Fitness

Este directorio contiene la infraestructura de la base de datos SQL Server para el sistema.

## Orden de Ejecución para levantar desde cero

Si necesitas levantar el esquema desde cero en un nuevo entorno, debes ejecutar los scripts en el siguiente orden:

1. `schema/01_schema.sql` (Crea las tablas, índices, constraints)
2. `schema/02_stored_procedures.sql` (Crea procedimientos almacenados optimizados)
3. `migrations/*.sql` (Aplica las migraciones en orden alfabético si hay cambios posteriores)
4. `seeds/seed.sql` (Opcional, para poblar datos de prueba iniciales)

*Nota: El script `backend-gimnasio/seeders/seedRunner.js` puede estar configurado para correr estos archivos. Verifica las rutas en ese script si lo utilizas.*

## Datos de Demostración

Para revisar los paneles o preparar una demostración con información realista (socios con distintos estados de membresía, pagos aprobados y pendientes, asistencias, rutinas, clases y evaluaciones), desde `backend-gimnasio/`:

```bash
npm run seed          # datos maestros: roles, planes y administrador
npm run seed:demo     # gimnasio completo de demostración
```

Todas las cuentas generadas usan el dominio `@demo.slimminggym.com` y la contraseña `Gimnasio2026`. Ese dominio es el único marcador que las distingue de los usuarios reales, y es lo que permite borrarlas sin tocar producción:

```bash
npm run seed:demo:limpiar
```

Los datos son deterministas: dos ejecuciones producen exactamente las mismas cifras. Detalle de los perfiles generados en `backend-gimnasio/seeders/demoData.js`.

## Archivos y Documentación

- `DICCIONARIO_DATOS.md`: Contiene las reglas del dominio, restricciones de los estados y estructura de cada tabla.
- `README_INSTALACION_VM.md`: Guía para levantar el contenedor con Docker Compose y configurar la seguridad (Usuario con mínimos privilegios).
- `cloud_db_security_config.md`: Explicación de la arquitectura de seguridad y red para aislar la base de datos.

## Scripts de Mantenimiento

- `scripts/backup.sh`: Realiza un respaldo automatizado y lo encripta.
- `scripts/restaurar.sh`: Desencripta un respaldo y reconstruye la base de datos.
