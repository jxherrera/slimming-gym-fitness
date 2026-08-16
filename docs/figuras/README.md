# Figuras del trabajo de titulación

Carpeta con las **16 figuras** que pide el documento. Se dividen en dos grupos:

| | Figuras | Estado |
|---|---|---|
| Diagramas (elaboración propia) | 1, 2, 3, 4, 5, 6, 14 | ✅ **generadas aquí**, listas para insertar |
| Capturas de pantalla | 7, 8, 9, 10, 11, 12, 13, 15, 16 | 📸 hay que tomarlas — instrucciones abajo |

---

## 1. Diagramas ya generados

Cada diagrama existe en dos formatos:

- **`.svg`** — vectorial, fuente editable. Es el que conviene insertar en Word
  (Insertar → Imágenes → Este dispositivo). Word 2016 en adelante lo admite y
  el texto no se pixela al imprimir.
- **`.png`** — mismo diagrama a 2× de resolución, por si el revisor abre el
  documento en una versión de Word que no soporte SVG.

| Archivo | Figura |
|---|---|
| `figura-01-arquitectura-tres-capas` | Arquitectura de tres capas del sistema |
| `figura-02-cadena-procesamiento-peticion` | Cadena de procesamiento de una petición |
| `figura-03-casos-de-uso` | Diagrama de casos de uso |
| `figura-04-diagrama-de-clases` | Diagrama de clases |
| `figura-05-diagrama-entidad-relacion` | Diagrama entidad-relación |
| `figura-06-diagrama-de-despliegue` | Diagrama de despliegue |
| `figura-14-despliegue-contenedores-volumenes` | Despliegue con contenedores y volúmenes |

### Si hay que corregir algo

Los `.svg` son texto plano: se abren con cualquier editor, o con draw.io
(Archivo → Abrir → seleccionar el `.svg`) si se prefiere mover cajas con el
ratón. Después de editar, para regenerar los `.png`:

```bash
cd docs/figuras && ./render.sh
```

El script usa Google Chrome en modo sin interfaz; no hace falta instalar nada.

---

## 2. Pies de figura en formato APA 7

Listos para pegar. El orden es: **Figura N** en negrita → título en cursiva →
imagen → *Nota*.

> **Figura 1**
> *Arquitectura de tres capas del sistema*
>
> [imagen]
>
> *Nota.* Elaboración propia.

> **Figura 2**
> *Cadena de procesamiento de una petición*
>
> [imagen]
>
> *Nota.* Diagrama de secuencia UML del recorrido de una petición autenticada.
> Elaboración propia.

> **Figura 3**
> *Diagrama de casos de uso*
>
> [imagen]
>
> *Nota.* Los tres roles heredan de un actor genérico los casos de uso comunes.
> Elaboración propia.

> **Figura 4**
> *Diagrama de clases*
>
> [imagen]
>
> *Nota.* Se representan las 13 entidades centrales del dominio. Elaboración propia.

> **Figura 5**
> *Diagrama entidad-relación*
>
> [imagen]
>
> *Nota.* Modelo lógico de las 23 tablas implementadas en SQL Server 2022.
> Elaboración propia.

> **Figura 6**
> *Diagrama de despliegue*
>
> [imagen]
>
> *Nota.* Elaboración propia.

> **Figura 14**
> *Diagrama de despliegue con contenedores y volúmenes*
>
> [imagen]
>
> *Nota.* Detalle de la red interna de Docker Compose y de los volúmenes
> persistentes. Elaboración propia.

Para las capturas, la nota cambia a: *Nota.* Captura de pantalla del sistema
en funcionamiento. Elaboración propia.

---

## 3. Antes de tomar cualquier captura: cargar datos realistas

El documento pide nombres verosímiles, no `asdasd`. El repositorio ya trae un
conjunto de datos de demostración: **4 entrenadores y 30 socios** con
suscripciones, pagos aprobados y pendientes, asistencias, rutinas, clases y
evaluaciones físicas de los últimos meses.

```bash
cd backend-gimnasio && npm run seed:demo
```

Todas las cuentas usan la contraseña `Gimnasio2026` y el dominio
`@demo.slimminggym.com`. Para borrarlas después:

```bash
cd backend-gimnasio && npm run seed:demo:limpiar
```

**Recomendaciones para que las capturas se vean limpias:**

- Navegador en pantalla completa (`F11`) y zoom al 100 % (`Ctrl+0`).
- Modo claro, no oscuro: imprime mejor en papel.
- Ocultar la barra de marcadores del navegador.
- Recortar la captura al área útil; no incluir el escritorio ni la barra de tareas.
- Guardar en PNG, nunca en JPG (el texto pequeño se degrada).

---

## 4. Instrucciones por figura

### 📸 Figura 7 — Estructura de directorios del repositorio

1. Abrir la carpeta del proyecto en Visual Studio Code.
2. En el explorador lateral, **contraer todo** (icono de las dos flechas) y
   luego expandir únicamente estas tres carpetas de primer nivel:
   `backend-gimnasio`, `database` y `frontend-gimnasio`.
3. Dentro de `backend-gimnasio` expandir `controllers`, `routes` y `utils`;
   dentro de `frontend-gimnasio` expandir `src`; dentro de `database` expandir
   `schema` y `migrations`.
4. Ensanchar el panel lateral hasta que ningún nombre quede cortado con `...`.
5. Capturar **solo el panel del explorador**, no toda la ventana.

### 📸 Figura 8 — Esquema de la base de datos implementado

Desde **SQL Server Management Studio**:

1. Conectarse a la instancia y desplegar la base `GymDatabase`.
2. Clic derecho en **Diagramas de base de datos** → *Nuevo diagrama de base de datos*.
   (Si aparece el aviso de objetos de soporte que faltan, aceptar: los crea solo.)
3. Añadir las tablas. Si entran las 23 sin que el texto quede ilegible, mejor;
   si no, seleccionar las **10 centrales**: `Users`, `Roles`, `Plans`,
   `Subscriptions`, `Payments`, `Routines`, `RoutineExercises`, `Attendance`,
   `PhysicalEvaluations` y `Classes`.
4. Clic derecho sobre el fondo → *Organizar tablas*, y luego *Zoom → Ajustar*.
5. Capturar el área del diagrama.

> Esta figura es la prueba de que el esquema **está realmente implementado**;
> por eso debe salir de SSMS y no reutilizar la Figura 5.

### 📸 Figura 9 — Panel del entrenador con navegación por pestañas

1. Iniciar sesión con una cuenta de **entrenador** (`npm run seed:demo` crea cuatro).
2. Ir a `/coach`.
3. La barra lateral muestra las tres entradas del panel: **Mis Alumnos**,
   **Mi Agenda** y **Gestor de Rutinas**.
4. Capturar con la pestaña **Mis Alumnos** activa y la lista de alumnos visible.
5. Opcionalmente, una segunda captura en `/coach?mode=agenda` para la agenda semanal.

⚠️ El documento habla de pestañas llamadas *«Agenda Semanal»* y *«Mis Alumnos»*.
En la interfaz actual se llaman **«Mi Agenda»** y **«Mis Alumnos»**. Hay que
ajustar el texto del capítulo o el nombre del botón, para que coincidan.

### 📸 Figura 10 — Pantalla de control de ingreso

1. Iniciar sesión como **administrador**.
2. Barra lateral → **Control de Ingreso** (ruta `/admin/accesos`).
3. Escribir la cédula de un socio con membresía vigente en el campo
   **Número de cédula** y validar.
4. Capturar en el momento en que aparece el resultado con la membresía activa.
5. Vale la pena tomar también el caso de **membresía vencida**: demuestra que la
   regla de negocio se aplica, no solo el camino feliz.

### 📸 Figura 11 — Verificación de un comprobante de pago

1. Iniciar sesión como **administrador**.
2. Ir a `/admin/pagos/verificacion` (**Verificación de Comprobantes de Pago**).
3. Seleccionar una transferencia pendiente de la lista de la izquierda.
4. El panel derecho muestra la **imagen del comprobante** y los botones
   *Aprobar Transacción* / *Rechazar Pago*.
5. Capturar con el comprobante visible y el cursor sobre *Aprobar Transacción*.

### 📸 Figura 12 — Constructor de rutinas del entrenador

1. Iniciar sesión como **entrenador** e ir a `/coach`.
2. En la lista de alumnos, abrir el modal de asignación de rutina.
3. Seleccionar un día de la semana y añadir dos o tres ejercicios, de modo que
   se vean las columnas **Series**, **Reps** y **Peso (Lbs)** con valores.
4. Capturar el modal completo, incluyendo el botón *Agregar ejercicio*.

También sirve la pantalla `/coach/rutinas` (Gestor de Rutinas) si se prefiere
mostrar el trabajo con plantillas.

### 📸 Figura 13 — Registro de evaluación física e historial de progreso

1. Iniciar sesión como **socio** con historial (los del dataset de demo lo tienen).
2. Ir a `/member` y bajar hasta la sección de progreso.
3. La gráfica de Recharts con la evolución del peso ya se ve en la página.
4. Pulsar **Registrar Medidas** para abrir el formulario (*Peso Actual*,
   grasa corporal, masa muscular).
5. Capturar con el modal abierto y la gráfica visible detrás: esa es la
   «vista dual» que describe el documento.

### 📸 Figura 15 — Salida de la suite de pruebas unitarias

```bash
cd backend-gimnasio && npm test
```

Ejecutada el 15 de agosto de 2026 devuelve **33 pruebas, 33 aprobadas, 0 fallidas**
(no 20, como dice el borrador). Capturar la terminal mostrando las últimas líneas
con los `✔` y el resumen `pass 33 / fail 0`.

Si la terminal es muy alta, ampliar la fuente (`Ctrl` + `+`) y capturar solo el
tramo final: los últimos diez `✔` más el bloque de totales.

### 📸 Figura 16 — Evidencia del reparto de peticiones entre réplicas

⚠️ **Importante:** `docker compose logs api` **no** sirve tal cual. La API no
tiene registro de peticiones HTTP, así que en esos logs solo aparecen las líneas
de arranque, no una petición por línea. La evidencia real del balanceo se obtiene
del endpoint `/api/health`, que devuelve el identificador del contenedor que
atendió la petición.

**Preparación:**

```bash
docker compose up -d --build --scale api=3
```

**Captura A — las tres réplicas activas:**

```bash
docker compose ps
```

**Captura B — el reparto (esta es la figura):**

```bash
for i in $(seq 1 12); do curl -sk https://localhost/api/health | grep -o '"instance":"[^"]*"'; done
```

Cada línea muestra un identificador de contenedor distinto, rotando entre las
tres réplicas: esa alternancia **es** la prueba de que Nginx reparte la carga.

**Captura C — complemento, que el cron corre en una sola instancia:**

```bash
docker compose logs api | grep -c "programadas activadas"
docker compose logs worker | grep -c "programadas activadas"
```

Deben devolver `0` y `1` respectivamente.

Si de todos modos se prefiere la evidencia por logs, hay que añadir
temporalmente un registrador de peticiones en `backend-gimnasio/server.js`
(por ejemplo `app.use((req,_res,next)=>{console.log(process.env.HOSTNAME,req.method,req.url);next()})`),
reconstruir las imágenes y quitarlo después. La opción del `/api/health` es más
limpia y no toca el código que se entrega.

---

## 5. Diferencias detectadas entre el documento y el código

Verificadas sobre el repositorio el **15 de agosto de 2026**. Conviene corregir
el texto antes de entregar, porque los diagramas de esta carpeta usan las cifras
reales y quedarían en contradicción con el capítulo.

| Dato | Dice el documento | Valor real | Dónde se comprueba |
|---|---|---|---|
| Tablas de la base | 10 | **23** | `database/schema/01_schema.sql` (11) + `database/migrations/20260810_tablas_faltantes.sql` (12) |
| Endpoints REST | 69 | **79** | `grep -c "router\.\(get\|post\|put\|patch\|delete\)" backend-gimnasio/routes/*.js` |
| Pruebas unitarias | 20 | **33** | `cd backend-gimnasio && npm test` |
| Volúmenes persistentes | 2 | **2 de datos + 1 auxiliar** | `docker-compose.yml`: `sqldata`, `uploads` y `certbot-webroot` |
| Pestañas del panel del entrenador | «Agenda Semanal» y «Mis Alumnos» | «Mi Agenda» y «Mis Alumnos» | `frontend-gimnasio/src/components/layout/AdminSidebar.jsx` |

Las cifras del capítulo provienen de `docs/inventario-tesis.md`, con fecha de
corte del 9 de agosto de 2026; el proyecto ha crecido desde entonces. Si se
actualiza el texto, conviene actualizar también ese inventario.
