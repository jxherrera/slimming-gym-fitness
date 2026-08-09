# Inventario técnico del proyecto — Slimming Gym Fitness

Documento de referencia para la redacción del trabajo de titulación. Todas las
cifras se obtuvieron midiendo el repositorio, no por estimación.

Fecha de corte: **9 de agosto de 2026**

---

## 1. Ficha técnica

| Concepto | Valor |
|---|---|
| Nombre del sistema | Slimming Gym Fitness |
| Tipo | Aplicación web de gestión integral para gimnasio |
| Arquitectura | Cliente–servidor de tres capas, con API REST desacoplada |
| Repositorio | `github.com/jxherrera/slimming-gym-fitness` (monorepo) |
| Periodo de desarrollo | 26 de febrero de 2026 – en curso (≈ 5,5 meses) |
| Integrantes | 3 desarrolladores |
| Endpoints REST implementados | **69** |
| Tablas en la base de datos | **10** |
| Páginas de interfaz | **25** |
| Componentes reutilizables | **21** |
| Rutas de navegación | **14** |
| Líneas de código propio | **≈ 23 150** |
| Commits | **132** |
| Pull Requests revisados y mergeados | **38** |
| Pruebas unitarias automatizadas | **20** (backend) + 1 archivo (frontend) |

### Distribución de líneas de código

| Capa | Líneas |
|---|---|
| Backend (JavaScript) | 4 807 |
| Frontend (JavaScript / JSX) | 10 704 |
| Hojas de estilo (CSS) | 7 441 |
| Scripts de base de datos (SQL) | 196 |
| **Total** | **≈ 23 148** |

---

## 2. Arquitectura del sistema

Arquitectura de **tres capas** con separación estricta de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA DE PRESENTACIÓN                                       │
│  React 19 + Vite · SPA · React Router 7                     │
│  Landing pública · Panel Admin · Panel Coach · Panel Socio  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / JSON
                            │ Authorization: Bearer <JWT>
┌───────────────────────────▼─────────────────────────────────┐
│  CAPA DE LÓGICA DE NEGOCIO                                  │
│  Node.js 22 + Express 5 · API REST                          │
│  Rutas → Middleware (auth/rol) → Controladores → Servicios  │
└───────────────────────────┬─────────────────────────────────┘
                            │ Consultas parametrizadas (mssql)
┌───────────────────────────▼─────────────────────────────────┐
│  CAPA DE DATOS                                              │
│  Microsoft SQL Server 2022                                   │
│  10 tablas · Stored Procedures · Triggers · Restricciones   │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de una petición

```
Navegador
  → Nginx (proxy inverso y balanceador)
    → réplica de la API (round-robin)
      → authMiddleware        valida la firma del JWT
      → checkRole             verifica el rol requerido
      → checkOwnership        verifica que el recurso sea del solicitante
        → Controlador         orquesta el caso de uso
          → Servicio / Util   regla de negocio pura
            → SQL Server      consulta parametrizada
      → errorHandler          captura centralizada de excepciones
```

---

## 3. Stack tecnológico

### 3.1 Backend

| Tecnología | Versión | Función | Por qué se eligió |
|---|---|---|---|
| **Node.js** | 22 LTS | Entorno de ejecución | Un solo lenguaje en todo el proyecto; modelo de E/S no bloqueante adecuado para una API con muchas operaciones de base de datos. Se usa la línea 22 porque la 20 alcanzó su fin de vida en abril de 2026 |
| **Express** | 5.2 | Framework web | Minimalista y basado en middleware, lo que permite componer la cadena de autenticación, autorización y manejo de errores de forma explícita |
| **mssql** | 12.5 | Controlador de base de datos | Cliente oficial para SQL Server con soporte de *connection pooling*, transacciones y **consultas parametrizadas** (prevención de inyección SQL) |
| **jsonwebtoken** | 9.0 | Autenticación | Implementación de JWT (RFC 7519) |
| **bcrypt** | 6.0 | Hash de contraseñas | Función de derivación de clave deliberadamente lenta, con *salt* individual |
| **multer** | 2.2 | Recepción de archivos | Procesa `multipart/form-data` en memoria para los comprobantes de pago |
| **nodemailer** | 9.0 | Correo electrónico | Envío de notificaciones transaccionales por SMTP |
| **node-cron** | 4.5 | Tareas programadas | Verificación diaria de vencimientos de membresía |
| **pdfkit** | 0.19 | Generación de PDF | Reportes por socio en el servidor |
| **dotenv** | 17.4 | Configuración | Externaliza credenciales y parámetros por entorno |
| **cors** | 2.8 | Control de origen | Lista blanca de orígenes autorizados |

### 3.2 Frontend

| Tecnología | Versión | Función |
|---|---|---|
| **React** | 19.2 | Biblioteca de interfaz basada en componentes |
| **Vite** | 7.3 | Empaquetador y servidor de desarrollo; compilación optimizada |
| **React Router** | 7.14 | Enrutado del lado del cliente, rutas protegidas por rol |
| **axios** | 1.18 | Cliente HTTP con interceptores para inyectar el token y capturar el 401 |
| **Recharts** | 3.9 | Gráficas de progreso físico |
| **react-big-calendar** | 1.20 | Calendario de clases y horarios de entrenadores |
| **jsPDF** + autotable | 4.2 / 5.0 | Exportación de rutinas a PDF en el cliente |
| **react-icons** | 5.7 | Iconografía |
| **react-transition-group** | 4.4 | Animaciones de transición |
| **moment** | 2.30 | Manejo de fechas (dependencia de react-big-calendar) |

### 3.3 Herramientas de calidad y desarrollo

| Herramienta | Versión | Función |
|---|---|---|
| **ESLint** | 9.39 | Análisis estático; reglas de React Hooks |
| **Vitest** | 4.1 | Pruebas unitarias del frontend |
| **node:test** | nativo | Pruebas unitarias del backend, sin dependencias externas |
| **Git / GitHub** | — | Control de versiones, ramas por integrante, revisión por Pull Request |
| **Jira** | — | Gestión del backlog y de los Sprints |

### 3.4 Infraestructura

| Tecnología | Función |
|---|---|
| **Docker Engine + Compose** | Contenerización de los cuatro servicios del sistema |
| **Nginx 1.27** | Servidor web, proxy inverso y balanceador de carga |
| **Google Cloud Platform — Compute Engine (VM)** | Máquina virtual Linux que aloja el sistema completo |
| **Microsoft SQL Server 2022** (contenedor) | Motor de base de datos |
| **Let's Encrypt / Certbot** | Certificados TLS para HTTPS |
| **Ubuntu Server 22.04 LTS** | Sistema operativo de la VM |
| **UFW** | Cortafuegos del host |

---

## 4. Estructura del código

```
slimming-gym-fitness/
│
├── docker-compose.yml          Orquestación: db, api, worker, proxy
├── .env.example                Plantilla de variables de Compose
├── .gitignore                  Excluye secretos, respaldos y artefactos
│
├── backend-gimnasio/           API REST (Node.js + Express)
│   ├── Dockerfile              Imagen sobre node:22-alpine, usuario sin privilegios
│   ├── .dockerignore           Impide que el .env entre en la imagen
│   ├── server.js               Punto de entrada: CORS, rutas, manejo de errores
│   ├── config/
│   │   ├── db.js               Pool de conexiones con reintentos
│   │   └── jwt.js              Única fuente del secreto de firma
│   ├── middleware/
│   │   ├── authMiddleware.js   authMiddleware · checkRole · checkOwnership
│   │   └── errorHandler.js     Captura centralizada de excepciones
│   ├── routes/                 14 archivos, 69 endpoints
│   ├── controllers/            14 controladores (uno por módulo funcional)
│   ├── services/
│   │   ├── emailService.js     Envío y registro de correos
│   │   ├── emailTemplates.js   Plantillas HTML
│   │   ├── storageService.js   Almacenamiento de archivos abstraído
│   │   └── userService.js      Consultas compuestas de usuario
│   ├── utils/
│   │   ├── accessRules.js      Regla de acceso al gimnasio (función pura)
│   │   ├── validators.js       Política de contraseñas y campos obligatorios
│   │   ├── healthStatus.js     Armado de la respuesta de estado
│   │   ├── asyncHandler.js     Envoltorio de controladores asíncronos
│   │   ├── AppError.js         Error de aplicación con código HTTP
│   │   └── *.test.js           20 pruebas unitarias
│   ├── cron/
│   │   └── expirationChecker.js  Aviso de vencimiento a 3 días
│   ├── scripts/                Diagnóstico y operación (5 scripts)
│   └── seeders/                Carga de datos iniciales idempotente
│
├── frontend-gimnasio/          Interfaz (React + Vite)
│   ├── nginx.conf              Proxy inverso, balanceo y enrutado SPA
│   ├── vite.config.js          División de paquetes, alias, proxy de desarrollo
│   └── src/
│       ├── App.jsx             Enrutado y rutas protegidas por rol
│       ├── pages/              25 páginas
│       │   ├── home/           Landing pública
│       │   ├── planes/         Catálogo público de membresías
│       │   ├── sobrenossotros/ Página institucional
│       │   ├── login/          Autenticación
│       │   └── admin/          Paneles: dashboard, accesos, pagos, planes,
│       │                       horarios, correos, coaches, socio
│       ├── components/
│       │   ├── common/         Modal, Toast, Spinner, Skeleton, Alertas
│       │   ├── layout/         Navbar, AdminLayout, AdminSidebar
│       │   └── member/         Suscripción, pagos, progreso, entrenamiento
│       ├── services/           8 servicios; api.js centraliza el cliente HTTP
│       ├── context/            AuthContext · ThemeContext · ToastContext
│       └── hooks/              useAuth · useToast · useNotifications
│
├── database/                   Esquema, procedimientos, migraciones y semillas
│
└── docs/
    ├── despliegue-vm.md        Procedimiento de despliegue reproducible
    └── inventario-tesis.md     Este documento
```

---

## 5. Patrones y métodos de ingeniería aplicados

Esta sección alimenta directamente el Marco Teórico: son patrones con nombre
propio y respaldo bibliográfico, aplicados de forma verificable en el código.

| Patrón / método | Dónde se aplica | Qué problema resuelve |
|---|---|---|
| **Arquitectura en capas** | Separación rutas → controladores → servicios → datos | Aísla el cambio: modificar una consulta no toca la interfaz |
| **API REST** | 69 endpoints con verbos HTTP semánticos y códigos de estado | Interfaz uniforme e independiente del cliente |
| **Patrón Middleware (Chain of Responsibility)** | `authMiddleware` → `checkRole` → `checkOwnership` → controlador | Compone la seguridad en piezas pequeñas y reutilizables |
| **Autenticación sin estado (JWT)** | `config/jwt.js`, `authMiddleware.js` | Permite escalar horizontalmente sin sesiones compartidas |
| **Control de acceso basado en roles (RBAC)** | Tabla `Roles`, `checkRole([...])` | Autorización declarativa por endpoint |
| **Inyección de dependencias por parámetro** | `evaluateAccess(rol, sub, now)` recibe la fecha | Hace la lógica determinista y testeable |
| **Funciones puras para reglas de negocio** | `utils/accessRules.js`, `utils/validators.js` | Permite pruebas unitarias sin base de datos |
| **Repositorio / capa de servicio** | `services/userService.js`, `storageService.js` | El controlador no conoce el detalle de almacenamiento |
| **Inversión de dependencia en almacenamiento** | `storageService` con interfaz `guardar/eliminar/resolver` | Cambiar de la nube a disco local no tocó el controlador de pagos |
| **Manejo centralizado de errores** | `middleware/errorHandler.js` + `utils/asyncHandler.js` | Elimina bloques `try/catch` repetidos |
| **Transacciones ACID** | Aprobación de pagos y registro de entrenamiento | Garantiza que pago y suscripción se actualicen juntos o ninguno |
| **Consultas parametrizadas** | Todas las consultas del proyecto | Previene inyección SQL (OWASP A03) |
| **Stored Procedures** | `sp_GetPublicPlans` | Reduce el tráfico y encapsula la consulta pública |
| **Triggers de integridad** | Base de datos | Reglas que se cumplen sin depender de la aplicación |
| **Carga diferida (lazy loading) y división de código** | `React.lazy` en `App.jsx`, `manualChunks` en Vite | La landing no descarga el código del panel administrativo |
| **Componentes controlados y elevación de estado** | Formularios de todo el sistema | Estado único y predecible |
| **Context API + hooks personalizados** | `AuthContext`, `useAuth`, `useToast` | Evita pasar propiedades por muchos niveles |
| **Rutas protegidas** | `ProtectedRoute` con `allowedRoles` | Mejora de experiencia; la seguridad real está en el servidor |
| **Optimistic UI / estados de carga** | `Skeleton`, `Spinner`, `Toast` | Percepción de rapidez y retroalimentación inmediata |
| **Contenerización e infraestructura como código** | `Dockerfile`, `docker-compose.yml` | Entorno idéntico en desarrollo y producción |
| **Construcción multietapa** | Imagen del frontend | La imagen final no contiene el compilador ni el código fuente |
| **Balanceo por resolución DNS (round-robin)** | `nginx.conf` con `resolver` | Reparte carga entre réplicas de la API |
| **Separación liveness / readiness** | `/api/health/live` vs `/api/health` | Una caída de la base no marca como muertas todas las réplicas |
| **Aislamiento de tareas programadas** | Servicio `worker` con `ENABLE_CRON` | Impide que N réplicas ejecuten N veces el mismo cron |
| **Persistencia por volúmenes** | `sqldata`, `uploads` | Los datos sobreviven a la destrucción de los contenedores |
| **Idempotencia** | Semillas, migraciones, notificaciones del cron | Reejecutar no duplica ni falla |

---

## 6. Modelo de datos

**Motor:** Microsoft SQL Server 2022

| Tabla | Contenido |
|---|---|
| `Roles` | Catálogo de roles: Member, Coach, Admin |
| `Users` | Datos de socios, entrenadores y administradores; hash de contraseña |
| `Plans` | Catálogo de planes de membresía (precio, duración) |
| `Subscriptions` | Suscripción de un socio a un plan, con vigencia y estado de pago |
| `Payments` | Pagos reportados, comprobante y estado de verificación |
| `Attendance` | Bitácora de ingresos al gimnasio |
| `Routines` | Rutinas asignadas por el entrenador |
| `Notifications` | Notificaciones internas al socio |
| `CoachPermissions` | Permisos granulares por entrenador |
| `CoachAssignments` | Relación entrenador–socio |

**Objetos adicionales:** Stored Procedures, Triggers de integridad, restricciones
`CHECK` sobre los estados del dominio, índices sobre las columnas de consulta
frecuente, y claves foráneas con comportamiento explícito ante borrado.

**Estados canónicos del dominio:**

| Columna | Valores |
|---|---|
| `Users.Status` | `A` activo · `I` inactivo |
| `Subscriptions.PaymentStatus` | `P` pagada · `U` pendiente |
| `Payments.Status` | `A` aprobado · `P` pendiente · `R` rechazado |

---

## 7. Módulos funcionales implementados

| Módulo | Endpoints | Funcionalidad |
|---|---|---|
| **Autenticación** | 3 | Registro público, inicio de sesión con JWT, alta de usuarios con rol por parte del administrador |
| **Gestión de usuarios** | 12 | CRUD, activación y desactivación, borrado lógico y definitivo, cambio de contraseña, consulta de suscripción, notificaciones e historial de pagos |
| **Planes de membresía** | 4 | Catálogo público y administración completa |
| **Pagos y suscripciones** | 6 | Reporte con comprobante, verificación por el administrador, historial, webhook para pasarela externa |
| **Rutinas y entrenamiento** | 15 | Plantillas, catálogo de ejercicios, asignación entrenador–socio, rutina vigente, modo de entrenamiento con historial |
| **Entrenadores** | 9 | Listado, permisos, asignación de socios, configuración |
| **Horarios** | 5 | Gestión de disponibilidad de entrenadores |
| **Clases grupales** | 5 | Creación, reserva y cancelación |
| **Evaluaciones físicas** | 2 | Registro de mediciones e historial de progreso |
| **Control de ingreso** | 2 | Validación de acceso por cédula en tiempo real y bitácora del día |
| **Reportes** | 1 | Generación de PDF por socio |
| **Correo electrónico** | 2 | Envío masivo desde el panel y listado de destinatarios |
| **Entrenamiento** | 1 | Registro transaccional de sesión completada |
| **Estado del sistema** | 2 | Sondas para contenedores y balanceador |
| **Total** | **69** | |

**Notificaciones automáticas:** tarea programada diaria que avisa al socio con
tres días de anticipación al vencimiento de su membresía, creando la notificación
interna y enviando el correo correspondiente.

---

## 8. Seguridad implementada

| Medida | Implementación | Amenaza mitigada (OWASP Top 10) |
|---|---|---|
| Autenticación con JWT firmado (HS256, vigencia 24 h) | `config/jwt.js` | A07 Fallos de identificación y autenticación |
| Secreto de firma obligatorio; el servidor no arranca sin él | `config/jwt.js` | A02 Fallos criptográficos |
| Hash de contraseñas con bcrypt y *salt* individual | `authController.js` | A02 Fallos criptográficos |
| Política de contraseñas (longitud y composición) | `utils/validators.js` | A07 |
| Autorización por rol en los 69 endpoints | `checkRole` | **A01 Pérdida de control de acceso** |
| Verificación de propiedad del recurso | `checkOwnership` | A01 (referencia directa insegura a objetos) |
| Registro público que no permite elegir rol | `authController.register` | A01 (escalada de privilegios) |
| Consultas parametrizadas en el 100 % de los accesos a datos | Todos los controladores | **A03 Inyección** |
| Lista blanca de tipos MIME en la subida de archivos | `storageService.js` | A03 (XSS almacenado vía SVG/HTML) |
| Extensión derivada del tipo MIME, nunca del nombre del cliente | `storageService.js` | A03 |
| Nombres de archivo aleatorios de 32 caracteres | `storageService.js` | A01 (enumeración de recursos) |
| Protección contra travesía de directorios | `storageService.js` | A01 |
| Secreto compartido en el webhook de pagos | `paymentController.js` | A07 |
| Lista blanca de orígenes (CORS) | `server.js` | A05 Configuración de seguridad incorrecta |
| Secretos fuera del control de versiones | `.gitignore`, `.dockerignore` | A05 |
| Contenedor ejecutado con usuario sin privilegios | `Dockerfile` | A05 |
| Puertos de base de datos y API no publicados | `docker-compose.yml` | A05 |
| Usuario de base de datos con permisos mínimos | Documentado en `database/` | A01 |
| HTTPS con certificado válido | Nginx + Certbot | A02 |
| Prevención de enumeración de usuarios | Pantalla de recuperación | A07 |
| Respaldos cifrados con datos personales | `database/scripts/backup.sh` | Protección de datos (LOPDP) |

---

## 9. Infraestructura y despliegue

### 9.1 Arquitectura de despliegue

Máquina virtual única en **Google Cloud Platform (Compute Engine)** con Ubuntu
Server, sobre la que corren cuatro contenedores orquestados con Docker Compose:

| Servicio | Imagen | Réplicas | Puertos publicados | Tareas programadas |
|---|---|---|---|---|
| `proxy` | Nginx 1.27 (multietapa con el frontend) | 1 | 80, 443 | — |
| `api` | Node 22 Alpine (propia) | escalable (1–N) | ninguno | no |
| `worker` | la misma imagen que `api` | 1 fija | ninguno | **sí** |
| `db` | SQL Server 2022 | 1 | ninguno | — |

**Volúmenes persistentes:**

| Volumen | Contenido |
|---|---|
| `sqldata` | Base de datos completa |
| `uploads` | Comprobantes de pago, compartido entre réplicas |

### 9.2 Ventajas de esta arquitectura

- **Entorno reproducible**: versiones de Node y SQL Server fijadas en la
  definición, idénticas en las tres máquinas de desarrollo y en el servidor.
- **Despliegue en un comando** y actualización sin interrupción del servicio,
  sustituyendo réplicas por tandas.
- **Escalado horizontal** de la capa de aplicación, posible únicamente porque la
  autenticación con JWT no guarda estado: cualquier réplica atiende cualquier
  petición sin afinidad de sesión ni almacén compartido.
- **Aislamiento**: la API corre sin privilegios y la base de datos no expone su
  puerto a la red.

### 9.3 Limitación reconocida

El balanceo reparte carga entre réplicas **de un mismo host**. Eso proporciona
reparto de trabajo, despliegues sin corte y tolerancia al fallo de una réplica,
pero **no constituye alta disponibilidad**: la máquina virtual sigue siendo un
punto único de fallo. La evolución natural sería replicar la aplicación en varias
VM tras un balanceador externo y separar la base de datos en una instancia
dedicada con replicación.

### 9.4 Decisión: contenedores frente a proceso nativo

Se evaluó ejecutar la API directamente con un gestor de procesos (PM2) y se optó
por contenedores. El caso que motivó la decisión ocurrió en el propio proyecto: el
script de pruebas dependía de una expansión de patrones presente en Node 22 pero
ausente en Node 20, y funcionaba en la máquina de desarrollo mientras fallaba en
otro entorno. Fijar la versión del entorno de ejecución en la definición de la
imagen elimina esa clase de fallo.

### 9.5 Servicios de nube retirados

Durante el desarrollo se usaron y posteriormente se retiraron: **Cloud Run**
(despliegue del backend), **Firebase Hosting** (publicación del frontend),
**Cloud SQL** (base de datos administrada) y **Google Cloud Storage**
(comprobantes). La migración a una VM propia con almacenamiento local
consolidó toda la infraestructura en un único entorno bajo control del equipo y
eliminó cuatro dependencias externas.

---

## 10. Calidad y pruebas

| Tipo | Herramienta | Cantidad | Alcance |
|---|---|---|---|
| Pruebas unitarias del backend | `node:test` nativo | **20** | Reglas de acceso al gimnasio (9), política de contraseñas y campos obligatorios (7), respuesta de estado (4) |
| Pruebas unitarias del frontend | Vitest | 1 archivo | Utilidades del modo de entrenamiento |
| Análisis estático | ESLint 9 | — | Reglas de React Hooks y detección de código muerto |
| Verificación de autorización | Servidor efímero sobre las rutas reales | 16 casos | 11 que deben bloquear (401/403) y 5 que deben permitir |
| Verificación de almacenamiento | Script de comprobación | 8 casos | Tipos permitidos y rechazados, travesía de directorios |
| Verificación de balanceo | Tres réplicas con alias de red | — | Reparto 3-3-3 y conmutación por fallo sin errores 502 |
| Pruebas de integridad de base | Script de concurrencia | — | Comportamiento de los triggers |
| Pruebas en el artefacto real | `docker compose run api npm test` | 20 | La suite se ejecuta contra la imagen que se despliega |

Las pruebas se ejecutan también dentro de la imagen Docker, de modo que se
verifica el artefacto que llega a producción y no solo el código local.

---

## 11. Metodología

**Marco de trabajo: Scrum**, con evidencia verificable en el repositorio.

| Indicador | Valor |
|---|---|
| Commits | 132 |
| Pull Requests revisados y mergeados | 38 |
| Ramas de trabajo | 8 (una por integrante más integración) |
| Duración | 26 de febrero – 8 de agosto de 2026 |
| Gestión del backlog | Jira |
| Convención de mensajes | Conventional Commits |

**Prácticas aplicadas:**

- **Ramas por integrante** e integración a la rama principal exclusivamente por
  Pull Request, lo que fuerza la revisión de código por pares.
- **Definición de Terminado (DoD)**: revisión por otro integrante, pruebas
  unitarias sobre la lógica de negocio, verificación funcional de los endpoints y
  validación en la Revisión de Sprint.
- **Verificación transversal a cada Sprint**, no como fase terminal. Los ítems de
  los últimos meses del cronograma corresponden a pruebas de aceptación del
  usuario (UAT) y despliegue a producción.
- **Migraciones de base de datos versionadas** con nombre fechado, de modo que el
  orden alfabético coincide con el cronológico.

> **Nota para el informe de contribuciones:** el historial contiene siete
> identidades de Git para tres personas (Kevin figura con cuatro y Josue con dos),
> porque cada uno comiteó desde distintas máquinas o configuraciones. Conviene
> añadir un archivo `.mailmap` que unifique las identidades antes de generar
> cualquier gráfica de contribución para el documento; de lo contrario el reparto
> del trabajo aparece distorsionado.

---

## 12. Estado de avance y trabajo pendiente

### 12.1 Completado y verificado

- Gestión de usuarios y roles con los tres perfiles
- Catálogo de planes con administración y consulta pública dinámica
- Pagos: reporte con comprobante, verificación administrativa, historial, webhook
- Suscripciones con vigencia y estado
- Rutinas: plantillas, catálogo de ejercicios, asignación, modo de entrenamiento
- Evaluaciones físicas con gráficas de progreso
- Clases grupales con reserva y cancelación
- Horarios de entrenadores
- **Control de ingreso en tiempo real con bitácora**
- Reportes en PDF
- Notificaciones internas y por correo, con aviso automático de vencimiento
- Landing pública conectada a la API
- Tema claro y oscuro
- Capa de seguridad completa (sección 8)
- Infraestructura Docker con persistencia y balanceo
- Documentación de despliegue reproducible

### 12.2 En ejecución

| Tarea | Responsable |
|---|---|
| Endpoints de recuperación de contraseña | Josue |
| Centralización del cliente HTTP del frontend | Kevin |
| Dockerfile multietapa del frontend | Kevin |
| Pantallas de recuperación de contraseña | Kevin |
| Landing sin datos codificados en el JSX | Kevin |
| Corrección del identificador de entrenador fijo | Ariel |
| Reconciliación del esquema versionado con la base real | Ariel |
| Índices, restricciones `CHECK` e integridad referencial | Ariel |
| Contenedor de base de datos y respaldos cifrados | Ariel |
| Diccionario de datos | Ariel |

### 12.3 Pendiente de decisión o de una fase posterior

- Pantalla de administración de permisos de entrenador (la tabla y el endpoint
  existen; falta la interfaz)
- Reestructuración de carpetas del frontend por módulo funcional
- Ampliación de la cobertura de pruebas del frontend
- Migración de datos y despliegue final en la máquina virtual
- Pruebas de aceptación del usuario con el personal del gimnasio

---

## 13. Anexos sugeridos para el documento de titulación

| Anexo | Origen |
|---|---|
| Diagrama de arquitectura de tres capas | Sección 2 |
| Diagrama de despliegue con contenedores y volúmenes | `docs/despliegue-vm.md` |
| Modelo entidad-relación | `database/schema/01_schema.sql` |
| Diccionario de datos | `database/DICCIONARIO_DATOS.md` |
| Catálogo de los 69 endpoints con su nivel de autorización | Sección 7 y `routes/` |
| Matriz de permisos por rol | `middleware/authMiddleware.js` y `routes/` |
| Manual de despliegue | `docs/despliegue-vm.md` |
| Evidencia de metodología: capturas de Jira y del historial de Pull Requests | GitHub y Jira |
| Evidencia de pruebas: salida de `npm test` y de la verificación de autorización | Terminal |
| Evidencia de balanceo: salida de las nueve peticiones alternando réplicas | Terminal |
| Tabla de mitigación de amenazas OWASP | Sección 8 |
| Capturas de la interfaz por perfil de usuario | Aplicación |
