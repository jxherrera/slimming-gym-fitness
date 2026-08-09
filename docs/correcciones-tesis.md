# Correcciones del documento de titulación — texto listo para pegar

Documento de trabajo. Contiene el prompt maestro, la lista de correcciones de
formato y **todos los bloques de texto ya redactados** para reemplazar o añadir
en `FORMATO DE TESIS DS 1.docx`.

Convención usada aquí:

- 🔴 **REEMPLAZAR** — borra el párrafo actual y pega el nuevo.
- 🟢 **AÑADIR** — sección que hoy no existe en el documento.
- ⚠️ `[VERIFICAR]` — dato que debes confirmar antes de entregar.

Las cifras provienen de `docs/inventario-tesis.md`, medidas sobre el repositorio.

---

# PARTE 0 — Prompt maestro

Si vas a apoyarte en una herramienta de IA para aplicar los cambios, pega esto
junto con el archivo Word:

> Actúa como corrector académico de un trabajo de titulación de Tecnología
> Superior en Desarrollo de Software de la PUCE (Ecuador). Te adjunto el borrador
> "Sistema web de gestión de procesos y rutinas para el gimnasio Slimming Gym &
> Fitness".
>
> Aplica exactamente estas reglas y no inventes información técnica que no esté
> en el texto que te entrego:
>
> 1. **Unifica la numeración**: el Capítulo I usa secciones 1.1, 1.2…; el
>    Capítulo II usa 2.1, 2.2…; el Capítulo III usa 3.1, 3.2… Elimina la
>    numeración "4.-" del Capítulo I y la numeración corrida "1.-, 2.-, 3.-" de
>    Introducción, Planteamiento del Problema y Objetivos (esas van sin número).
> 2. **Formato uniforme en todo el documento**: Times New Roman 12, interlineado
>    doble, párrafos justificados, sangría de primera línea de 1,27 cm. Hay
>    páginas en otra fuente y a espacio sencillo: corrígelas.
> 3. **Paginación**: preliminares en números romanos en minúscula (i, ii, iii…)
>    y cuerpo del trabajo en arábigos comenzando en 1 desde la Introducción.
> 4. **Cada capítulo inicia en página nueva**; elimina las páginas en blanco
>    sobrantes.
> 5. **Numera todas las figuras y tablas** con el formato APA 7:
>    "Figura 1" en negrita, título en cursiva debajo, y nota de fuente al pie.
>    Actualiza la Lista de tablas y la Lista de figuras.
> 6. **Elimina toda mención a Google Cloud Storage, buckets y SDK de Google**:
>    esa tecnología fue retirada del proyecto y sustituida por almacenamiento
>    local en la máquina virtual servido por Nginx.
> 7. **Corrige la ortografía y la sintaxis** manteniendo el registro académico
>    impersonal: "se desarrolló", "se implementó", nunca primera persona.
> 8. **Actualiza la tabla de contenidos** con títulos y páginas reales; elimina
>    los marcadores resaltados en amarillo.
> 9. Todas las afirmaciones conceptuales (Scrum, REST, tercera forma normal,
>    inyección SQL, JWT) deben llevar **cita APA 7** con su entrada
>    correspondiente en Referencias.
>
> Devuélveme el documento corregido y, aparte, la lista de cambios aplicados.

---

# PARTE 1 — Correcciones de formato (lista de verificación en Word)

| # | Corrección | Dónde |
|---|---|---|
| 1 | Aplicar Times New Roman 12, interlineado doble y justificado a **todo** el documento | pp. 26–28 y 30 están en otra fuente y a espacio sencillo |
| 2 | Numerar preliminares en romanos (i, ii, iii…) mediante salto de sección | pp. 1–10 |
| 3 | Reiniciar la numeración arábiga en 1 desde la Introducción | p. 11 en adelante |
| 4 | Insertar salto de página antes de cada capítulo | Capítulo III arranca a media página 26 |
| 5 | Eliminar la página en blanco | p. 21 |
| 6 | Actualizar la tabla de contenidos y quitar los marcadores amarillos | p. 4 |
| 7 | Sustituir los seis marcadores "CAPTURA AQUÍ" por figuras numeradas | pp. 23, 25 y 26 |
| 8 | Completar Lista de tablas y Lista de figuras (hoy dicen "xxxxxxx") | pp. 5–6 |
| 9 | Unificar el nombre del sistema como **Slimming Gym & Fitness** | portada y todo el cuerpo |
| 10 | Reordenar preliminares: Portada → Declaración y autorización → Dedicatoria → Agradecimientos → Resumen → Abstract → Tabla de contenidos → Lista de tablas → Lista de figuras | pp. 1–10 |
| 11 | Unificar formato de las tres dedicatorias y colocar cada una con su encabezado en la misma página que su texto | pp. 2–3 |

**Correcciones ortográficas puntuales:**

| Página | Dice | Debe decir |
|---|---|---|
| 3 | "expresó mi más sincero agradecimiento" | "expreso mi más sincero agradecimiento" |
| 14 | "los requerimientos que se necesarios" | "los requerimientos necesarios" |
| 14 | "cuando un socio se le allá vencida o en estado suspendido su membrecía" | "cuando la membresía de un socio se encuentre vencida o suspendida" |
| 15 | "diversos tipos planes de suscripción" | "diversos tipos de planes de suscripción" |
| 15 | "para que los entrenadores puedan creen rutinas" | "para que los entrenadores creen rutinas" |
| 16 | "asegurar la una integridad referencial" | "asegurar la integridad referencial" |
| 16 | "En base a ala solución" | "Con base en la solución" |
| 19 | "SCRUM nos ofrece" | "Scrum ofrece" |
| 25 | "en la imágen" | "en la imagen" |

---

# PARTE 2 — Bloques de reemplazo

## 2.1 🔴 Portada — línea de autores

**Reemplazar** `Autores: Josue,X. Herrera, Ariel,G. Rueda y Kevin,F. Erazo.` por:

> **Autores:** Herrera Vera, Josue Xavier; Rueda Guevara, Ariel Giuseppe; Erazo
> Delgado, Kevin Fernando

---

## 2.2 🔴 Introducción (p. 11)

**Reemplazar el párrafo completo por:**

> La transformación digital de las pequeñas y medianas empresas del sector
> deportivo constituye una necesidad operativa antes que una aspiración
> tecnológica. En este contexto, el presente trabajo describe el diseño, la
> construcción y la puesta en producción de un sistema web integral para el
> gimnasio Slimming Gym & Fitness, orientado a unificar en una sola plataforma la
> gestión administrativa de socios y membresías con la planificación deportiva a
> cargo de los entrenadores.
>
> El sistema se construyó sobre una arquitectura cliente-servidor de tres capas
> con una interfaz de programación de aplicaciones (API) REST desacoplada. La
> capa de presentación se implementó como una Aplicación de Página Única (SPA)
> con React 19 y el empaquetador Vite, lo que permite una navegación sin recargas
> y una interfaz diferenciada para cada uno de los tres perfiles del sistema:
> administrador, entrenador y socio. La capa de lógica de negocio se desarrolló
> con Node.js 22 y el framework Express 5, y expone sesenta y nueve endpoints
> protegidos mediante autenticación sin estado con JSON Web Tokens y autorización
> basada en roles. La capa de datos se sustenta en Microsoft SQL Server 2022, con
> un esquema relacional de diez tablas normalizado hasta la tercera forma normal,
> reforzado con restricciones de integridad, procedimientos almacenados y
> disparadores.
>
> El despliegue se resolvió mediante contenerización con Docker y Docker Compose
> sobre una máquina virtual de Google Cloud Platform, con Nginx actuando como
> servidor web, proxy inverso y balanceador de carga entre réplicas de la API.
> Esta decisión garantiza que el entorno de ejecución sea idéntico en las
> máquinas de desarrollo del equipo y en el servidor de producción, y habilita el
> escalado horizontal de la capa de aplicación.
>
> El proceso de desarrollo se condujo bajo el marco de trabajo Scrum, con
> entregas iterativas e incrementales, gestión del backlog en Jira e integración
> del código exclusivamente mediante Pull Request revisado por pares. El
> documento se organiza en tres capítulos: el primero aborda el levantamiento de
> requisitos y el diseño del sistema; el segundo detalla la construcción de cada
> capa y la infraestructura de despliegue; y el tercero presenta la estrategia de
> pruebas, los resultados obtenidos y la estabilización del producto.

---

## 2.3 🔴 Planteamiento del problema (p. 12) — añadir cierre

Conserva el texto actual y **añade este párrafo al final**:

> El problema, en consecuencia, no se limita a la ausencia de una herramienta
> informática: radica en la fragmentación de la información institucional en
> registros aislados que impiden la trazabilidad del ciclo de vida del socio,
> desde su inscripción y el estado de su membresía hasta su progreso físico
> medible. Esta fragmentación se traduce en pérdidas económicas por membresías
> vencidas que no se detectan a tiempo, en la imposibilidad de auditar los pagos
> recibidos y en un servicio de entrenamiento que no puede personalizarse con
> base en evidencia. De ahí se desprende la pregunta que orienta este trabajo:
> ¿de qué manera un sistema web con arquitectura de tres capas y base de datos
> relacional centralizada permite integrar la gestión administrativa y la
> planificación deportiva del gimnasio Slimming Gym & Fitness, garantizando la
> integridad, la seguridad y la disponibilidad de la información?

---

## 2.4 🔴 Objetivos (p. 13)

**Reemplazar la sección completa por:**

> ### Objetivo general
>
> Desarrollar e implementar un sistema web integral de gestión administrativa y
> deportiva para el gimnasio Slimming Gym & Fitness, sustentado en una
> arquitectura de tres capas y una base de datos relacional centralizada, que
> automatice el control de membresías, el registro de ingresos y la asignación
> técnica de rutinas.
>
> ### Objetivos específicos
>
> - Centralizar la información institucional en una base de datos relacional
>   normalizada que garantice la integridad referencial y permita gestionar el
>   ciclo de vida completo del socio, desde su registro y suscripción hasta el
>   control de sus pagos y de su asistencia.
> - Digitalizar la planificación del entrenamiento mediante una interfaz que
>   permita al entrenador construir rutinas personalizadas con variables de
>   carga, registrar evaluaciones físicas periódicas y visualizar el progreso del
>   socio a lo largo del tiempo.
> - Desplegar la plataforma sobre una infraestructura contenerizada en la nube,
>   con proxy inverso, balanceo de carga y comunicación cifrada, aplicando
>   controles de seguridad alineados con el OWASP Top 10 que aseguren la
>   confidencialidad y la disponibilidad de la información.

---

## 2.5 🔴 Capítulo I — encabezado y sección 1.1 (p. 14)

**Reemplazar** `4.- Levantamiento de Requisitos y Diseño del Sistema` y su párrafo por:

> ## Capítulo I
> ## Levantamiento de requisitos y diseño del sistema
>
> El presente capítulo describe el proceso seguido para recopilar, analizar y
> especificar los requisitos funcionales y no funcionales del sistema, así como
> las decisiones de diseño que dieron forma a la solución. Se detallan las
> técnicas de levantamiento aplicadas, la especificación de requisitos
> organizada en épicas, la arquitectura propuesta, el modelado del sistema, las
> herramientas seleccionadas, el marco de trabajo empleado y las limitaciones
> reconocidas del producto.
>
> ### 1.1 Levantamiento de requisitos
>
> Para determinar las necesidades reales del gimnasio se realizó un diagnóstico
> de los procesos operativos vigentes en Slimming Gym & Fitness. El diagnóstico
> permitió identificar limitaciones tanto en la gestión administrativa como en el
> control de las rutinas asignadas a los socios. Se aplicaron dos técnicas de
> recolección de información:
>
> - **Entrevistas semiestructuradas.** Se sostuvieron reuniones con el personal
>   administrativo y con los entrenadores del gimnasio con el fin de comprender
>   sus dificultades diarias. Las entrevistas evidenciaron que el control de
>   vencimientos de membresía dependía de la memoria del personal y que la
>   prescripción de rutinas se registraba en cuadernos físicos, sin posibilidad
>   de consulta posterior.
> - **Observación directa.** Se analizó el flujo de trabajo en el mostrador de
>   recepción y en el área de entrenamiento. Se registraron demoras derivadas del
>   manejo manual de la información y la ausencia de un criterio único para
>   determinar si un socio se encontraba habilitado para ingresar.
>
> Los hallazgos se tradujeron en historias de usuario, se priorizaron en el
> Product Backlog según su valor para el negocio y se agruparon en once épicas.

---

## 2.6 🔴 Requisitos funcionales (pp. 14–15)

**Reemplazar la lista completa de RF por:**

> #### Requisitos funcionales
>
> **Épica 1: Gestión de identidad y control de sesión**
>
> - **RF-01.1 (Registro público).** El sistema debe permitir que una persona se
>   registre por sí misma desde el sitio público. El registro público no debe
>   permitir la elección del rol: todo usuario creado por esta vía recibe el
>   perfil de socio.
> - **RF-01.2 (Inicio de sesión).** El sistema debe autenticar al usuario
>   mediante correo electrónico y contraseña, y devolver una credencial de sesión
>   con vigencia limitada que identifique su rol.
> - **RF-01.3 (Alta de usuarios con rol).** El administrador debe poder crear
>   usuarios asignándoles explícitamente el perfil de socio, entrenador o
>   administrador.
> - **RF-01.4 (Política de contraseñas).** El sistema debe rechazar contraseñas
>   que no cumplan la longitud y composición mínimas definidas.
> - **RF-01.5 (Cambio y recuperación de contraseña).** El usuario debe poder
>   modificar su contraseña, y solicitar su recuperación sin que el sistema
>   revele si un correo se encuentra o no registrado.
>
> **Épica 2: Control de ingreso al gimnasio**
>
> - **RF-02.1 (Validación de acceso).** El sistema debe validar en tiempo real,
>   a partir del número de cédula, si un socio se encuentra habilitado para
>   ingresar, evaluando la vigencia de su suscripción y el estado de su cuenta.
> - **RF-02.2 (Bitácora de ingresos).** Cada validación exitosa debe generar
>   automáticamente un registro con la fecha y la hora del ingreso, conformando
>   un historial consultable por socio y por día.
> - **RF-02.3 (Alertas visuales).** La interfaz debe mostrar una alerta
>   inequívoca cuando la membresía del socio se encuentre vencida, suspendida o
>   próxima a expirar.
>
> **Épica 3: Administración de socios y membresías**
>
> - **RF-03.1 (Gestión integral de usuarios).** El administrador debe poder
>   crear, consultar, editar, activar, desactivar y eliminar perfiles de socios,
>   entrenadores y administradores, almacenando nombres, cédula y datos de
>   contacto.
> - **RF-03.2 (Búsqueda y filtrado).** El sistema debe permitir la búsqueda y el
>   filtrado de usuarios según su estado: activo, inactivo o con membresía
>   vencida.
> - **RF-03.3 (Administración de planes).** El sistema debe permitir la creación
>   y edición de planes de membresía con precio y duración, así como su
>   publicación en el catálogo público.
> - **RF-03.4 (Asignación de suscripciones).** El sistema debe vincular a un
>   socio con un plan, calculando automáticamente las fechas de inicio y
>   vencimiento a partir de la duración contratada.
> - **RF-03.5 (Control de vencimientos).** El sistema debe verificar diariamente
>   las suscripciones próximas a expirar y notificar al socio con antelación,
>   sin intervención del personal.
> - **RF-03.6 (Baja lógica).** La eliminación de un socio o de un plan con
>   historial asociado debe conservar el registro histórico mediante un cambio de
>   estado, no mediante su borrado físico.
>
> **Épica 4: Gestión financiera y auditoría**
>
> - **RF-04.1 (Reporte de pago).** El socio debe poder reportar un pago
>   adjuntando la imagen o el archivo del comprobante.
> - **RF-04.2 (Verificación administrativa).** El administrador debe poder
>   inspeccionar el comprobante y aprobar o rechazar el pago; la aprobación debe
>   actualizar el estado de la suscripción en la misma transacción.
> - **RF-04.3 (Historial de transacciones).** El sistema debe mantener el
>   historial de pagos por socio, con su estado y su comprobante asociado.
> - **RF-04.4 (Registro de auditoría).** Toda aprobación o rechazo debe quedar
>   registrada de forma automática con el usuario responsable y la marca de
>   tiempo.
> - **RF-04.5 (Integración con pasarela externa).** El sistema debe exponer un
>   punto de integración autenticado que permita registrar pagos provenientes de
>   una plataforma de cobro externa.
>
> **Épica 5: Planificación deportiva**
>
> - **RF-05.1 (Catálogo de ejercicios).** El sistema debe mantener un catálogo de
>   ejercicios disponible para la construcción de rutinas.
> - **RF-05.2 (Creación de rutinas).** El entrenador debe poder construir rutinas
>   personalizadas definiendo, por cada ejercicio, las series, las repeticiones y
>   la carga.
> - **RF-05.3 (Plantillas de rutina).** El sistema debe permitir guardar rutinas
>   como plantillas reutilizables.
> - **RF-05.4 (Asignación y seguimiento).** El entrenador debe poder asignar una
>   rutina a un socio y consultar la rutina vigente de cada uno de sus alumnos.
> - **RF-05.5 (Modo de entrenamiento).** El socio debe poder ejecutar su rutina
>   desde la aplicación, marcando los ejercicios completados y registrando la
>   sesión al finalizar.
> - **RF-05.6 (Exportación de la rutina).** El sistema debe permitir exportar la
>   rutina asignada en formato PDF.
>
> **Épica 6: Seguimiento del progreso físico**
>
> - **RF-06.1 (Registro de evaluaciones).** El entrenador debe poder registrar
>   peso, porcentaje de grasa y medidas perimetrales del socio en una fecha
>   determinada.
> - **RF-06.2 (Historial y visualización).** El sistema debe presentar la
>   evolución de las mediciones mediante gráficas que permitan identificar el
>   progreso o el estancamiento del socio.
>
> **Épica 7: Agenda y clases grupales**
>
> - **RF-07.1 (Horarios de entrenadores).** El sistema debe permitir registrar y
>   consultar la disponibilidad horaria de cada entrenador.
> - **RF-07.2 (Gestión de clases grupales).** El administrador o el entrenador
>   debe poder crear clases grupales indicando fecha, hora de inicio, hora de fin
>   y cupo.
> - **RF-07.3 (Reserva y cancelación).** El socio debe poder reservar un cupo en
>   una clase y cancelar su reserva; el sistema debe impedir reservas sobre clases
>   sin cupo disponible.
> - **RF-07.4 (Agenda semanal).** El entrenador debe visualizar su agenda semanal
>   de clases en formato de calendario.
>
> **Épica 8: Gestión de entrenadores**
>
> - **RF-08.1 (Asignación entrenador-socio).** El administrador debe poder
>   asignar socios a un entrenador y consultar la cartera de alumnos de cada uno.
> - **RF-08.2 (Permisos granulares).** El sistema debe permitir habilitar o
>   restringir por entrenador las funciones a las que accede.
>
> **Épica 9: Comunicación y notificaciones**
>
> - **RF-09.1 (Notificaciones internas).** El sistema debe generar notificaciones
>   dentro de la aplicación dirigidas al socio.
> - **RF-09.2 (Correo transaccional).** El sistema debe enviar por correo
>   electrónico los avisos de vencimiento y las confirmaciones relevantes.
> - **RF-09.3 (Envío masivo).** El administrador debe poder redactar y enviar un
>   correo a un conjunto filtrado de socios desde el panel administrativo.
>
> **Épica 10: Reportes**
>
> - **RF-10.1 (Reporte por socio).** El sistema debe generar en el servidor un
>   documento PDF con la información consolidada del socio.
> - **RF-10.2 (Tablero administrativo).** El panel del administrador debe
>   presentar los indicadores agregados del gimnasio.
>
> **Épica 11: Operación del sistema**
>
> - **RF-11.1 (Sondas de estado).** El sistema debe exponer puntos de consulta
>   que informen si el proceso se encuentra vivo y si está en condiciones de
>   atender peticiones, para uso del orquestador de contenedores y del
>   balanceador de carga.

---

## 2.7 🔴 Requisitos no funcionales (pp. 15–16)

**Reemplazar la lista completa por:**

> #### Requisitos no funcionales
>
> Los requisitos no funcionales se clasificaron siguiendo las características de
> calidad del producto de software definidas en la norma ISO/IEC 25010 (2011).
>
> | Código | Característica | Requisito |
> |---|---|---|
> | **RNF-01** | Eficiencia de desempeño | La interfaz se implementa como Aplicación de Página Única, de modo que la navegación entre vistas no genera recargas completas. La compilación aplica división de código y carga diferida, de manera que el sitio público no descargue el código de los paneles privados. |
> | **RNF-02** | Usabilidad | La interfaz debe ser operable por personal sin formación informática, presentar retroalimentación inmediata ante cada acción mediante notificaciones y estados de carga, y ofrecer tema claro y oscuro para reducir la fatiga visual en jornadas prolongadas. |
> | **RNF-03** | Integridad de datos | El motor de base de datos debe garantizar la integridad referencial mediante claves foráneas, restricciones `CHECK` sobre los estados del dominio y disparadores que impidan la eliminación de registros con historial asociado. Las operaciones que afectan a más de una tabla deben ejecutarse dentro de una transacción. |
> | **RNF-04** | Seguridad — autenticación | El acceso debe resolverse mediante JSON Web Token firmado con algoritmo HS256 y vigencia de veinticuatro horas. El servidor no debe iniciar si el secreto de firma no está configurado. |
> | **RNF-05** | Seguridad — autorización | Cada endpoint debe declarar los roles autorizados y verificar, cuando corresponda, que el recurso solicitado pertenezca a quien lo solicita. |
> | **RNF-06** | Seguridad — confidencialidad | Las contraseñas deben almacenarse mediante una función de hash con sal individual, nunca en texto plano. La comunicación entre el cliente y el servidor debe cifrarse con TLS. |
> | **RNF-07** | Seguridad — validación de entrada | El cien por ciento de los accesos a la base de datos debe realizarse mediante consultas parametrizadas. Los archivos que se suban deben validarse contra una lista blanca de tipos MIME, y su extensión debe derivarse del tipo declarado y nunca del nombre enviado por el cliente. |
> | **RNF-08** | Disponibilidad | La capa de aplicación debe poder ejecutarse en varias réplicas tras un balanceador, de modo que la caída de una réplica no interrumpa el servicio y las actualizaciones se realicen sin corte. |
> | **RNF-09** | Escalabilidad | La autenticación debe ser sin estado, de manera que cualquier réplica pueda atender cualquier petición sin afinidad de sesión ni almacén compartido. |
> | **RNF-10** | Mantenibilidad | El código debe estar organizado en capas con responsabilidades separadas, someterse a análisis estático y contar con pruebas unitarias sobre las reglas de negocio puras. |
> | **RNF-11** | Portabilidad | El entorno de ejecución debe estar definido en la propia imagen del contenedor, garantizando que las versiones del intérprete y del motor de base de datos sean idénticas en desarrollo y en producción. |
> | **RNF-12** | Compatibilidad | El sistema debe operar en navegadores web actualizados con soporte completo de JavaScript, sin requerir la instalación de complementos. |
> | **RNF-13** | Protección de datos personales | El sistema debe generar respaldos periódicos cifrados de la base de datos, en cumplimiento de la Ley Orgánica de Protección de Datos Personales del Ecuador. |

---

## 2.8 🔴 Arquitectura general (pp. 16–17)

**Reemplazar la sección 4.2.1 completa por:**

> ### 1.2 Diseño del sistema
>
> Esta sección describe cómo se tradujeron los requisitos en una solución
> técnica. Se detallan la arquitectura general, el modelado del sistema y los
> criterios que orientaron cada decisión de diseño.
>
> #### 1.2.1 Arquitectura general
>
> Se adoptó una **arquitectura cliente-servidor organizada en tres capas
> lógicas**, patrón que Sommerville (2011) recomienda cuando se requiere aislar
> el cambio: una modificación en la consulta a la base de datos no debe obligar a
> recompilar la interfaz, y un rediseño visual no debe alterar la lógica de
> negocio. La comunicación entre la capa de presentación y la capa de negocio se
> resuelve mediante una API REST que intercambia documentos JSON sobre HTTPS,
> siguiendo el estilo arquitectónico formulado por Fielding (2000).
>
> **Capa de presentación (frontend).** Se desarrolló como una Aplicación de
> Página Única con React 19 y Vite. El código fuente se organiza separando las
> vistas completas de la aplicación (`pages`) de los elementos de interfaz
> reutilizables (`components`), y centraliza el estado transversal —sesión, tema
> visual y notificaciones— mediante la Context API acompañada de hooks
> personalizados. El enrutado se resuelve con React Router, que aplica guardas de
> navegación verificando el rol del usuario antes de conceder acceso a un panel
> privado. Vite se encarga del empaquetado, la división del código en fragmentos
> y la optimización de los activos estáticos.
>
> **Capa de lógica de negocio (backend).** El servidor se construyó con Node.js
> 22 y Express 5, y expone sesenta y nueve endpoints REST agrupados en catorce
> módulos funcionales. El punto de entrada, `server.js`, configura la lista
> blanca de orígenes, monta las rutas y registra el manejador centralizado de
> errores. La responsabilidad se distribuye en cuatro niveles: los archivos de
> `routes` declaran las rutas HTTP y los roles autorizados; los `middleware`
> resuelven la autenticación, la autorización y el control de propiedad del
> recurso; los `controllers` orquestan cada caso de uso; y los `services` y
> `utils` concentran las reglas de negocio puras y las integraciones externas.
> Esta separación permite probar la lógica de negocio de forma aislada, sin
> levantar el servidor ni la base de datos.
>
> **Capa de datos (persistencia).** Se implementó un esquema relacional de diez
> tablas sobre Microsoft SQL Server 2022, normalizado hasta la tercera forma
> normal. La comunicación entre Node.js y el motor se realiza mediante el
> controlador oficial `mssql`, configurado con un *pool* de conexiones que evita
> el costo de abrir y cerrar conexiones en cada petición. Todas las consultas del
> proyecto son parametrizadas, lo que constituye la mitigación recomendada por
> OWASP (2021) frente a la inyección SQL.
>
> El recorrido completo de una petición atraviesa la siguiente cadena:
>
> ```
> Navegador
>   → Nginx (proxy inverso y balanceador de carga)
>     → Réplica de la API (selección por turno rotatorio)
>       → authMiddleware      valida la firma y la vigencia del JWT
>       → checkRole           verifica que el rol esté autorizado
>       → checkOwnership      verifica que el recurso pertenezca al solicitante
>         → Controlador       orquesta el caso de uso
>           → Servicio        aplica la regla de negocio
>             → SQL Server    consulta parametrizada
>       → errorHandler        captura centralizada de excepciones
> ```
>
> ⚠️ `[VERIFICAR]` Inserta aquí la **Figura 1. Arquitectura de tres capas del
> sistema** y la **Figura 2. Cadena de procesamiento de una petición**.

---

## 2.9 🔴 Modelado del sistema (p. 18)

**Reemplazar la sección 4.2.2 por:**

> #### 1.2.2 Modelado del sistema
>
> Se elaboraron los siguientes diagramas bajo el Lenguaje Unificado de Modelado
> (UML) para representar la estructura y el comportamiento del sistema:
>
> - **Diagrama de casos de uso.** Representa gráficamente las interacciones entre
>   los tres actores del sistema —administrador, entrenador y socio— y los
>   procesos que cada uno puede ejecutar: control de ingreso, gestión de
>   membresías, verificación de pagos, construcción y asignación de rutinas,
>   registro de evaluaciones físicas y reserva de clases grupales.
> - **Diagrama de clases.** Estructura la lógica estática del software,
>   detallando las entidades principales del dominio —Usuario, Rol, Plan,
>   Suscripción, Pago, Rutina, Evaluación y Asistencia—, sus atributos, sus
>   operaciones y las relaciones de cardinalidad entre ellas.
> - **Diagrama entidad-relación.** Modela el esquema lógico de la base de datos
>   relacional, con las diez tablas, sus claves primarias y foráneas, y las
>   restricciones que garantizan la integridad referencial de la información
>   financiera y de los perfiles de usuario.
> - **Diagrama de despliegue.** Representa la distribución física de los
>   componentes sobre la máquina virtual: los contenedores del proxy, de las
>   réplicas de la API, del proceso de tareas programadas y del motor de base de
>   datos, junto con los volúmenes de persistencia.
>
> ⚠️ `[VERIFICAR]` Inserta los cuatro diagramas como Figuras 3, 4, 5 y 6.

---

## 2.10 🔴 Herramientas utilizadas (pp. 18–19)

**Reemplazar la sección 4.3 completa por:**

> ### 1.3 Herramientas y tecnologías utilizadas
>
> La selección tecnológica se orientó por tres criterios: la existencia de un
> ecosistema maduro y documentado, la posibilidad de emplear un único lenguaje de
> programación en las dos capas de software —lo que reduce la carga cognitiva del
> equipo—, y la disponibilidad de versiones con soporte vigente.
>
> #### 1.3.1 Capa de presentación
>
> | Tecnología | Versión | Función |
> |---|---|---|
> | React | 19.2 | Biblioteca para la construcción de interfaces basadas en componentes |
> | Vite | 7.3 | Empaquetador y servidor de desarrollo; compilación optimizada para producción |
> | React Router | 7.14 | Enrutado del lado del cliente y rutas protegidas por rol |
> | axios | 1.18 | Cliente HTTP con interceptores para adjuntar el token y capturar la expiración de la sesión |
> | Recharts | 3.9 | Representación gráfica del progreso físico del socio |
> | react-big-calendar | 1.20 | Calendario de clases grupales y horarios de entrenadores |
> | jsPDF y jsPDF-AutoTable | 4.2 / 5.0 | Exportación de rutinas y listados a PDF desde el navegador |
> | react-icons | 5.7 | Iconografía de la interfaz |
> | react-transition-group | 4.4 | Animaciones de transición entre vistas |
>
> #### 1.3.2 Capa de lógica de negocio
>
> | Tecnología | Versión | Función |
> |---|---|---|
> | Node.js | 22 LTS | Entorno de ejecución de JavaScript en el servidor, con modelo de entrada y salida no bloqueante |
> | Express | 5.2 | Framework web minimalista basado en middleware |
> | mssql | 12.5 | Controlador oficial de SQL Server, con *pool* de conexiones, transacciones y consultas parametrizadas |
> | jsonwebtoken | 9.0 | Generación y verificación de JSON Web Tokens (RFC 7519) |
> | bcrypt | 6.0 | Función de hash con sal individual para el almacenamiento de contraseñas |
> | multer | 2.2 | Procesamiento de formularios multiparte para la carga de comprobantes |
> | nodemailer | 9.0 | Envío de correo transaccional por SMTP |
> | node-cron | 4.5 | Ejecución de tareas programadas |
> | pdfkit | 0.19 | Generación de documentos PDF en el servidor |
> | dotenv | 17.4 | Externalización de credenciales y parámetros por entorno |
> | cors | 2.8 | Control de orígenes autorizados |
>
> #### 1.3.3 Capa de datos
>
> | Tecnología | Versión | Función |
> |---|---|---|
> | Microsoft SQL Server | 2022 | Sistema gestor de base de datos relacional, seleccionado por su soporte a transacciones ACID, procedimientos almacenados y disparadores |
>
> Se evaluó el uso de un mapeador objeto-relacional (ORM) y se optó por el
> controlador nativo con consultas parametrizadas. La decisión respondió a dos
> razones: el control explícito sobre el SQL generado, necesario para aprovechar
> los procedimientos almacenados y los disparadores del esquema, y el valor
> académico de trabajar directamente con el lenguaje de consulta, evitando la
> capa de abstracción que un ORM interpone entre el desarrollador y el motor.
>
> #### 1.3.4 Infraestructura y despliegue
>
> | Tecnología | Versión | Función |
> |---|---|---|
> | Docker Engine y Docker Compose | — | Contenerización y orquestación de los cuatro servicios del sistema |
> | Nginx | 1.27 | Servidor web, proxy inverso y balanceador de carga |
> | Google Cloud Platform — Compute Engine | — | Máquina virtual que aloja el sistema |
> | Ubuntu Server | 22.04 LTS | Sistema operativo del servidor |
> | Let's Encrypt y Certbot | — | Emisión y renovación automática de certificados TLS |
> | UFW | — | Cortafuegos del host |
>
> #### 1.3.5 Herramientas de desarrollo y calidad
>
> | Herramienta | Versión | Función |
> |---|---|---|
> | Visual Studio Code | — | Entorno de desarrollo empleado en las dos capas de software |
> | Git y GitHub | — | Control de versiones, ramas por integrante e integración mediante Pull Request revisado por pares |
> | Jira | — | Gestión del Product Backlog y seguimiento de los Sprints |
> | ESLint | 9.39 | Análisis estático del código y verificación de las reglas de los hooks de React |
> | Vitest | 4.1 | Pruebas unitarias de la capa de presentación |
> | node:test | nativo | Pruebas unitarias de la capa de negocio, sin dependencias externas |
> | Postman | — | Verificación manual de los endpoints durante el desarrollo |

---

## 2.11 🔴 Metodología (pp. 19–20)

**Reemplazar la sección 4.4 completa por:**

> ### 1.4 Marco de trabajo metodológico
>
> El desarrollo se condujo bajo **Scrum**, marco de trabajo definido por Schwaber
> y Sutherland (2020) para abordar problemas complejos mediante entregas
> iterativas e incrementales. Su elección respondió a la naturaleza cambiante del
> requerimiento: el personal del gimnasio no disponía de una especificación
> cerrada al inicio, y varias necesidades —el control de ingreso por cédula y el
> seguimiento de evaluaciones físicas, entre otras— se identificaron recién al
> presentar los primeros incrementos funcionales.
>
> #### 1.4.1 Roles y ceremonias
>
> ⚠️ `[VERIFICAR]` Ajusta los nombres a los roles que efectivamente asumieron.
>
> El equipo estuvo conformado por tres desarrolladores. El tutor del proyecto
> actuó como Product Owner al validar el valor de cada incremento, y el
> propietario del gimnasio participó como principal interesado en las Revisiones
> de Sprint. Se ejecutaron reuniones de Planificación al inicio de cada Sprint,
> sincronizaciones periódicas durante su transcurso, y Revisión y Retrospectiva
> al cierre.
>
> #### 1.4.2 Ejecución y evidencia
>
> El proyecto se desarrolló entre el 26 de febrero y el 9 de agosto de 2026,
> organizado en Sprints cuyo alcance quedó documentado en Jira y cuyos
> entregables son verificables en el repositorio.
>
> | Indicador | Valor |
> |---|---|
> | Duración total | 26 de febrero – 9 de agosto de 2026 |
> | Integrantes del equipo | 3 |
> | Sprints ejecutados | ⚠️ `[VERIFICAR]` (el repositorio registra migraciones hasta el Sprint 8) |
> | Commits registrados | 146 |
> | Pull Requests revisados e integrados | 38 |
> | Ramas de trabajo | 8 |
> | Endpoints REST implementados | 69 |
> | Líneas de código propio | ≈ 23 150 |
>
> #### 1.4.3 Prácticas aplicadas
>
> - **Entregas iterativas.** El ciclo se dividió en periodos cortos que
>   permitieron presentar al gimnasio módulos funcionales completos —el registro
>   de socios, el control de pagos, el control de ingreso— sin esperar al cierre
>   del proyecto.
> - **Gestión de prioridades.** El Product Backlog se ordenó según el valor para
>   el negocio, lo que aseguró que las funcionalidades críticas se construyeran
>   primero.
> - **Ramas por integrante e integración por Pull Request.** Ningún cambio llegó
>   a la rama principal sin la revisión de otro miembro del equipo, práctica que
>   permitió detectar defectos antes de su integración.
> - **Definición de Terminado.** Un elemento se consideró terminado únicamente
>   cuando había sido revisado por un par, contaba con pruebas unitarias sobre su
>   lógica de negocio, había sido verificado funcionalmente y se validó en la
>   Revisión de Sprint.
> - **Verificación transversal.** Las pruebas no se relegaron a una fase final:
>   se ejecutaron dentro de cada Sprint como parte de la Definición de Terminado.
> - **Migraciones versionadas.** Los cambios sobre el esquema de la base de datos
>   se registraron en archivos fechados, de modo que su orden alfabético coincide
>   con el cronológico y el esquema puede reconstruirse desde cero.
> - **Convención de mensajes de commit.** Se adoptó Conventional Commits, lo que
>   permite identificar la naturaleza de cada cambio en el historial.
>
> #### 1.4.4 Adaptabilidad
>
> El marco permitió incorporar requerimientos surgidos durante el desarrollo sin
> desestabilizar lo ya construido. El caso más representativo fue la sustitución
> del almacenamiento de comprobantes en un servicio de nube externo por
> almacenamiento local en la máquina virtual: dado que el controlador de pagos
> consumía una interfaz de almacenamiento y no el servicio concreto, el cambio se
> resolvió reemplazando un único módulo, sin modificar la lógica de negocio.

---

## 2.12 🔴 Limitaciones (p. 20)

**Reemplazar la sección 4.5 por:**

> ### 1.5 Limitaciones del sistema
>
> Se reconocen las siguientes condiciones y restricciones del producto entregado:
>
> - **Dependencia de conectividad.** Al estar desplegado sobre una infraestructura
>   remota, el sistema requiere una conexión a internet estable para validar los
>   accesos y registrar los pagos en tiempo real. No se implementó un modo de
>   operación sin conexión.
> - **Ausencia de integración con hardware.** El control de ingreso se opera desde
>   la interfaz web mediante el ingreso del número de cédula. El sistema no se
>   integra con torniquetes, lectores de proximidad ni dispositivos biométricos,
>   si bien la validación se expone como un endpoint independiente, lo que deja
>   preparada esa integración futura.
> - **Requisitos del cliente web.** La interfaz exige navegadores actualizados con
>   soporte completo de JavaScript. No se garantiza el funcionamiento en
>   navegadores sin mantenimiento vigente.
> - **Alta disponibilidad no alcanzada.** El balanceo de carga reparte el trabajo
>   entre réplicas alojadas en un mismo host, lo que proporciona distribución de
>   carga, despliegues sin interrupción y tolerancia al fallo de una réplica
>   individual. Sin embargo, la máquina virtual continúa siendo un punto único de
>   fallo: una caída del host interrumpe la totalidad del servicio.
> - **Cobertura de pruebas.** Las pruebas unitarias automatizadas cubren las
>   reglas de negocio puras de la capa de lógica. La verificación de la interfaz y
>   de los flujos completos se realizó de forma manual y mediante scripts de
>   comprobación, sin una suite automatizada de pruebas de extremo a extremo.
> - **Alcance del procesamiento de pagos.** El sistema registra y audita pagos
>   reportados con comprobante y expone un punto de integración para una pasarela
>   externa, pero no ejecuta por sí mismo el cobro electrónico.

---

## 2.13 🔴 Capítulo II — sección 2.1 Estructura del proyecto (p. 23)

**Reemplazar el párrafo sobre el "patrón multirepositorio" y la lista de tres
directorios por:**

> ### 2.1 Estructura general del proyecto
>
> Para asegurar la mantenibilidad, la escalabilidad y la separación de
> responsabilidades, el código fuente se organizó bajo un **repositorio único
> (monorepo)** que agrupa las tres capas del sistema en directorios
> independientes, junto con la definición de la infraestructura y la
> documentación técnica. Esta disposición permite versionar de forma conjunta
> cambios que afectan a varias capas —por ejemplo, un nuevo endpoint y la vista
> que lo consume— sin renunciar a la independencia de cada una.
>
> 1. **`database/`.** Contiene los scripts de definición de datos para SQL
>    Server: el esquema con las tablas, las relaciones y las restricciones; las
>    migraciones versionadas con nombre fechado; y los datos iniciales de prueba.
> 2. **`backend-gimnasio/`.** Representa la capa de lógica de negocio. Se
>    subdivide en `config` (conexión a la base de datos y secreto de firma),
>    `middleware` (autenticación, autorización y manejo centralizado de errores),
>    `routes` (declaración de los endpoints), `controllers` (orquestación de los
>    casos de uso), `services` (correo, almacenamiento de archivos y consultas
>    compuestas), `utils` (reglas de negocio puras y sus pruebas unitarias),
>    `cron` (tareas programadas), `seeders` (carga inicial idempotente) y
>    `scripts` (herramientas de diagnóstico y operación).
> 3. **`frontend-gimnasio/`.** Contiene la capa de presentación desarrollada con
>    React y Vite. Su directorio fuente separa las vistas completas (`pages`), los
>    elementos reutilizables (`components`), los clientes de la API (`services`),
>    el estado transversal (`context`) y los hooks personalizados (`hooks`).
> 4. **`docker-compose.yml` y `docs/`.** Definen respectivamente la orquestación
>    de los servicios en producción y la documentación de despliegue.
>
> ⚠️ `[VERIFICAR]` Sustituye el marcador "CAPTURA AQUÍ" por la **Figura 7.
> Estructura de directorios del repositorio**.

---

## 2.14 🔴 Capa de datos (pp. 23–24)

**Reemplazar la sección 2.2 completa por:**

> ### 2.2 Implementación de la capa de datos
>
> La base de datos se construyó sobre Microsoft SQL Server 2022, motor
> seleccionado por su soporte a transacciones ACID, procedimientos almacenados y
> disparadores. El esquema consta de **diez tablas** normalizadas hasta la
> **tercera forma normal**, condición que, siguiendo a Elmasri y Navathe (2016),
> elimina las dependencias transitivas entre atributos no clave y evita las
> anomalías de inserción, actualización y eliminación.
>
> | Tabla | Contenido |
> |---|---|
> | `Roles` | Catálogo de perfiles del sistema: socio, entrenador y administrador |
> | `Users` | Datos personales de todos los usuarios y el hash de su contraseña |
> | `Plans` | Catálogo de planes de membresía, con precio y duración |
> | `Subscriptions` | Vinculación entre un socio y un plan, con vigencia y estado de pago |
> | `Payments` | Pagos reportados, comprobante asociado y estado de verificación |
> | `Attendance` | Bitácora de ingresos al gimnasio |
> | `Routines` | Rutinas construidas y asignadas por el entrenador |
> | `Notifications` | Notificaciones internas dirigidas al socio |
> | `CoachAssignments` | Relación entre un entrenador y los socios a su cargo |
> | `CoachPermissions` | Permisos granulares habilitados por entrenador |
>
> La consolidación de administradores, entrenadores y socios en una única tabla
> `Users` diferenciada por rol evita la duplicación de los atributos comunes a los
> tres perfiles y permite que la autenticación opere sobre una sola entidad.
>
> Sobre este esquema se implementaron objetos adicionales:
>
> - **Restricciones `CHECK`** que acotan los estados del dominio a sus valores
>   válidos, de modo que un estado inconsistente no pueda persistirse aunque la
>   aplicación lo intente.
> - **Claves foráneas con comportamiento explícito ante el borrado**, que
>   preservan la integridad referencial entre socios, suscripciones, pagos y
>   rutinas.
> - **Disparadores de auditoría**, que registran de forma automática e
>   inalterable el usuario y la marca de tiempo de cada cambio de estado sobre un
>   comprobante de pago.
> - **Disparadores de baja lógica**, que interceptan la eliminación de un plan de
>   suscripción con historial asociado y la transforman en un cambio de estado a
>   inactivo, preservando el registro histórico.
> - **Procedimientos almacenados**, empleados para la consulta pública del
>   catálogo de planes.
> - **Índices** sobre las columnas de consulta frecuente.
>
> Los estados canónicos del dominio se codificaron de la siguiente manera:
>
> | Columna | Valores |
> |---|---|
> | `Users.Status` | `A` activo · `I` inactivo |
> | `Subscriptions.PaymentStatus` | `P` pagada · `U` pendiente |
> | `Payments.Status` | `A` aprobado · `P` pendiente · `R` rechazado |
>
> ⚠️ `[VERIFICAR]` Inserta la **Figura 8. Diagrama entidad-relación**.

---

## 2.15 🔴 Backend (p. 24) — elimina toda mención a Google Cloud Storage

**Reemplazar la sección 2.3 completa por:**

> ### 2.3 Implementación de la capa de lógica de negocio
>
> El servidor se construyó con Node.js bajo el framework Express, exponiendo
> servicios JSON mediante una arquitectura de endpoints REST. Se implementaron
> sesenta y nueve endpoints distribuidos en catorce módulos funcionales.
>
> #### 2.3.1 Conexión y acceso a datos
>
> Para evitar el costo de abrir y cerrar una conexión en cada petición, se
> implementó un *pool* de conexiones gestionado por el controlador oficial de
> Microsoft, `mssql`, con reintentos ante una indisponibilidad temporal del motor.
> La totalidad de las consultas del proyecto son parametrizadas: los valores
> enviados por el usuario nunca se concatenan a la sentencia SQL, sino que viajan
> como parámetros tipados. Esta es la mitigación que OWASP (2021) señala como
> defensa principal frente a la inyección SQL, categoría A03 de su clasificación
> de riesgos.
>
> #### 2.3.2 Autenticación y autorización
>
> El acceso se resuelve mediante JSON Web Token (Jones et al., 2015), firmado con
> el algoritmo HS256 y con una vigencia de veinticuatro horas. El secreto de
> firma se externaliza en una variable de entorno y el servidor se niega a
> iniciar si no está configurado, lo que impide que el sistema opere con un valor
> por defecto conocido. Las contraseñas se almacenan mediante bcrypt (Provos y
> Mazières, 1999), función de derivación deliberadamente costosa que aplica una
> sal individual a cada contraseña.
>
> La seguridad de cada petición se compone mediante una cadena de middleware, en
> aplicación del patrón Cadena de Responsabilidad (Gamma et al., 1995):
>
> - `authMiddleware` verifica la firma y la vigencia del token y adjunta la
>   identidad del solicitante a la petición.
> - `checkRole` comprueba que el rol del usuario figure entre los autorizados
>   para ese endpoint.
> - `checkOwnership` verifica, en los recursos de un socio concreto, que quien
>   los solicita sea su propietario o cuente con un rol administrativo,
>   impidiendo la referencia directa insegura a objetos.
>
> #### 2.3.3 Organización de la lógica y manejo de errores
>
> Los controladores orquestan cada caso de uso y delegan las reglas de negocio en
> funciones puras alojadas en `utils`, que reciben sus dependencias por parámetro
> —incluida la fecha de referencia— y por ello resultan deterministas y
> verificables sin base de datos. Las operaciones que afectan a más de una tabla,
> como la aprobación de un pago con su correspondiente actualización de la
> suscripción, se ejecutan dentro de una transacción, de modo que ambas
> operaciones se confirmen o se deshagan en conjunto.
>
> El manejo de excepciones se centralizó: un envoltorio de controladores
> asíncronos captura cualquier error y lo deriva a un único middleware que
> traduce la excepción al código de estado HTTP correspondiente y devuelve un
> mensaje uniforme. Esto elimina los bloques `try/catch` repetidos en cada
> controlador y garantiza que ningún detalle interno del servidor se filtre al
> cliente.
>
> #### 2.3.4 Almacenamiento de comprobantes de pago
>
> La recepción de los comprobantes se resuelve con `multer`, que procesa el
> formulario multiparte en memoria y lo entrega a un servicio de almacenamiento
> que abstrae el destino final del archivo. Los archivos se persisten en un
> directorio del servidor montado como volumen, de modo que sobreviven a la
> destrucción y recreación de los contenedores y resultan accesibles para todas
> las réplicas de la API. Nginx los publica bajo una ruta pública.
>
> El servicio de almacenamiento aplica tres controles: una lista blanca de tipos
> MIME que admite únicamente imágenes rasterizadas y documentos PDF —excluyendo
> deliberadamente HTML y SVG, capaces de ejecutar scripts en el origen de la
> aplicación—; la derivación de la extensión a partir del tipo MIME declarado y
> nunca del nombre enviado por el cliente; y la asignación de un nombre aleatorio
> que impide tanto la enumeración de comprobantes ajenos como la travesía de
> directorios.
>
> Dado que el controlador de pagos consume esta interfaz y no el mecanismo
> concreto de almacenamiento, el destino de los archivos puede sustituirse
> reemplazando un único módulo, en aplicación del principio de inversión de
> dependencias.
>
> #### 2.3.5 Tareas programadas y correo transaccional
>
> Se implementó una tarea programada que verifica diariamente las suscripciones
> próximas a vencer y notifica al socio con tres días de anticipación, creando la
> notificación interna y enviando el correo correspondiente mediante `nodemailer`.
> La tarea es idempotente: su reejecución sobre el mismo día no duplica avisos.
> Su ejecución está condicionada por una variable de entorno, de manera que
> únicamente el proceso dedicado a tareas de fondo la ejecuta y no cada una de
> las réplicas de la API.

---

## 2.16 🔴 Frontend (p. 25)

**Reemplazar la sección 2.4 completa por:**

> ### 2.4 Implementación de la capa de presentación
>
> La interfaz gráfica se desarrolló con la biblioteca React apoyada en el
> empaquetador Vite, conformando una Aplicación de Página Única. El sistema
> comprende veinticinco páginas y veintiún componentes reutilizables,
> distribuidos en un sitio público —con la página de inicio, el catálogo de
> planes y la información institucional— y tres paneles privados diferenciados
> por rol.
>
> **Enrutado y protección de vistas.** La navegación se resuelve con React
> Router. Un componente de ruta protegida intercepta el acceso a las vistas
> privadas y verifica que el usuario posea el rol requerido antes de permitir su
> renderizado. Cabe precisar que esta verificación cumple una función de
> experiencia de usuario: la autorización efectiva reside en el servidor, donde
> cada endpoint declara y comprueba los roles autorizados. Una guarda de cliente
> puede ser eludida manipulando el navegador; una verificación de servidor, no.
>
> **Gestión del estado.** El estado transversal —la sesión del usuario, el tema
> visual y las notificaciones emergentes— se centralizó mediante la Context API
> acompañada de hooks personalizados, lo que evita la transmisión de propiedades a
> través de múltiples niveles de componentes. Los formularios se implementaron
> como componentes controlados, de modo que el estado de la interfaz constituya
> una única fuente de verdad.
>
> **Comunicación con la API.** Todas las peticiones se canalizan mediante un
> cliente HTTP centralizado que adjunta automáticamente el token de sesión a cada
> petición e intercepta las respuestas de sesión expirada para redirigir al
> usuario al inicio de sesión.
>
> **Rendimiento.** Se aplicaron carga diferida de los componentes de ruta y
> división del código en fragmentos, de manera que el visitante del sitio público
> no descargue el código de los paneles administrativos.
>
> **Experiencia visual.** Se empleó CSS modular con variables personalizadas que
> permiten alternar dinámicamente entre modo claro y modo oscuro, reduciendo la
> fatiga visual del personal durante jornadas prolongadas. La retroalimentación
> al usuario se resuelve mediante notificaciones emergentes, indicadores de carga
> y esqueletos de contenido que anticipan la estructura de la información
> mientras esta se recupera del servidor.
>
> **Componentes destacados.** En el panel del entrenador se implementó una
> navegación por pestañas que alterna entre la agenda semanal de clases grupales
> y la lista de alumnos asignados sin recargar la página. Se construyeron
> componentes modales de vista dual que permiten, en una misma pantalla,
> registrar una medición física y visualizar simultáneamente el historial de
> progreso del socio. La visualización de la evolución física se resolvió con
> Recharts, y la agenda de clases con react-big-calendar.
>
> ⚠️ `[VERIFICAR]` Sustituye el marcador "CAPTURA AQUÍ" por la **Figura 9. Panel
> del entrenador con la navegación por pestañas**.

---

## 2.17 🔴 Integración de módulos (p. 26)

**Reemplazar el bloque de módulos por:**

> ### 2.5 Integración de módulos
>
> La interacción coordinada entre la capa de presentación, la capa de lógica de
> negocio y la base de datos permitió dar cumplimiento a los requisitos
> especificados. Los módulos implementados se resumen a continuación.
>
> | Módulo | Endpoints | Funcionalidad |
> |---|---|---|
> | Autenticación | 3 | Registro público, inicio de sesión y alta de usuarios con rol |
> | Gestión de usuarios | 12 | CRUD, activación, baja lógica y definitiva, cambio de contraseña, consulta de suscripción, notificaciones e historial |
> | Planes de membresía | 4 | Catálogo público y administración completa |
> | Pagos y suscripciones | 6 | Reporte con comprobante, verificación, historial e integración con pasarela externa |
> | Rutinas y entrenamiento | 15 | Plantillas, catálogo de ejercicios, asignación, rutina vigente y modo de entrenamiento |
> | Entrenadores | 9 | Listado, permisos, asignación de socios y configuración |
> | Horarios | 5 | Gestión de la disponibilidad de los entrenadores |
> | Clases grupales | 5 | Creación, reserva y cancelación |
> | Evaluaciones físicas | 2 | Registro de mediciones e historial de progreso |
> | Control de ingreso | 2 | Validación de acceso por cédula y bitácora del día |
> | Reportes | 1 | Generación de PDF por socio |
> | Correo electrónico | 2 | Envío masivo y consulta de destinatarios |
> | Registro de entrenamiento | 1 | Registro transaccional de la sesión completada |
> | Estado del sistema | 2 | Sondas para el orquestador y el balanceador |
> | **Total** | **69** | |
>
> **Módulo de gestión de accesos.** Valida en tiempo real, a partir del número de
> cédula ingresado en recepción, si el socio se encuentra habilitado. La decisión
> se delega en una función pura que evalúa el rol, el estado de la suscripción y
> la fecha de referencia, y devuelve un veredicto junto con su motivo. Cada
> validación exitosa inserta automáticamente un registro en la bitácora de
> asistencias.
>
> ⚠️ `[VERIFICAR]` **Figura 10. Pantalla de control de ingreso.**
>
> **Módulo financiero y de auditoría.** Proporciona al administrador una interfaz
> donde inspeccionar los comprobantes reportados por los socios y aprobarlos o
> rechazarlos. La aprobación actualiza el estado del pago y el de la suscripción
> dentro de una misma transacción, y queda registrada de forma automática en la
> tabla de auditoría mediante un disparador de base de datos.
>
> ⚠️ `[VERIFICAR]` **Figura 11. Verificación de un comprobante de pago.**
>
> **Módulo de planificación deportiva.** Desde su panel, el entrenador visualiza
> su cartera de alumnos y construye rutinas seleccionando ejercicios del catálogo
> y definiendo series, repeticiones y carga. El socio ejecuta la rutina asignada
> desde el modo de entrenamiento, que marca los ejercicios completados y registra
> la sesión al finalizar.
>
> ⚠️ `[VERIFICAR]` **Figura 12. Constructor de rutinas del entrenador.**
>
> **Módulo de agenda y evaluaciones físicas.** Integra la agenda semanal de
> clases grupales en formato de calendario con la herramienta de evaluación
> física, que permite registrar peso, porcentaje de grasa y medidas perimetrales
> y presenta la evolución del socio mediante gráficas.
>
> ⚠️ `[VERIFICAR]` **Figura 13. Registro de evaluación física e historial de
> progreso.**

---

# PARTE 3 — Secciones nuevas

## 3.1 🟢 Resumen (va antes de la tabla de contenidos)

> ### Resumen
>
> El presente trabajo de titulación describe el desarrollo e implementación de un
> sistema web integral de gestión para el gimnasio Slimming Gym & Fitness, cuya
> operación se sustentaba en registros manuales y plataformas aisladas que
> impedían la trazabilidad del ciclo de vida del socio y el control efectivo de
> las membresías. El sistema se construyó bajo una arquitectura cliente-servidor
> de tres capas: una interfaz de página única desarrollada con React y Vite, una
> interfaz de programación de aplicaciones REST implementada con Node.js y
> Express que expone sesenta y nueve endpoints, y una base de datos relacional en
> Microsoft SQL Server con diez tablas normalizadas hasta la tercera forma
> normal. La seguridad se resolvió mediante autenticación sin estado con JSON Web
> Tokens, autorización basada en roles, almacenamiento de contraseñas con función
> de hash y sal individual, y consultas parametrizadas en la totalidad de los
> accesos a datos. El despliegue se realizó sobre una máquina virtual en la nube
> mediante contenedores orquestados con Docker Compose, con Nginx como proxy
> inverso y balanceador de carga. El desarrollo se condujo bajo el marco de
> trabajo Scrum, con entregas iterativas, gestión del backlog en Jira e
> integración del código mediante revisión por pares. El sistema resultante
> unifica la gestión de socios, membresías, pagos, control de ingreso,
> planificación de rutinas, evaluaciones físicas y clases grupales en una única
> plataforma centralizada, verificada mediante pruebas unitarias automatizadas y
> pruebas de integración sobre el artefacto desplegado.
>
> **Palabras clave:** sistema web, arquitectura de tres capas, API REST, base de
> datos relacional, Scrum, contenerización, gestión deportiva.

---

## 3.2 🟢 Abstract

> ### Abstract
>
> This undergraduate thesis describes the development and implementation of a
> comprehensive web-based management system for the Slimming Gym & Fitness
> gymnasium, whose operations relied on manual records and isolated platforms
> that prevented member lifecycle traceability and effective membership control.
> The system was built on a three-tier client-server architecture: a single-page
> interface developed with React and Vite, a REST application programming
> interface implemented with Node.js and Express exposing sixty-nine endpoints,
> and a relational database in Microsoft SQL Server comprising ten tables
> normalized to third normal form. Security was addressed through stateless
> authentication with JSON Web Tokens, role-based authorization, password storage
> using a hashing function with individual salt, and parameterized queries across
> all data access. Deployment was carried out on a cloud virtual machine using
> containers orchestrated with Docker Compose, with Nginx serving as reverse
> proxy and load balancer. Development followed the Scrum framework, with
> iterative deliveries, backlog management in Jira, and code integration through
> peer review. The resulting system unifies member, membership, payment, access
> control, routine planning, physical assessment, and group class management
> within a single centralized platform, verified through automated unit tests and
> integration tests executed against the deployed artifact.
>
> **Keywords:** web system, three-tier architecture, REST API, relational
> database, Scrum, containerization, sports management.

---

## 3.3 🟢 Agradecimientos (plantilla — pega y personaliza)

> ### Agradecimientos
>
> Expresamos nuestro sincero agradecimiento a la Pontificia Universidad Católica
> del Ecuador y a la Unidad Académica de Formación Técnica y Tecnológica PUCE
> TEC, por la formación recibida a lo largo de esta carrera y por brindarnos las
> herramientas que hicieron posible el presente trabajo.
>
> De manera especial, agradecemos a nuestro tutor, Ing. Juan Agnelio Villacís
> Salazar, cuya guía, criterio técnico y disposición constante orientaron el
> desarrollo de este proyecto y nos exigieron sostener un estándar del que hoy
> nos sentimos responsables.
>
> Agradecemos también a la administración y al personal del gimnasio Slimming Gym
> & Fitness, por abrirnos las puertas de su institución, dedicarnos su tiempo en
> las entrevistas y permitirnos observar sus procesos, sin lo cual este sistema no
> habría respondido a una necesidad real.
>
> Finalmente, a los docentes que a lo largo de estos años compartieron con
> nosotros su conocimiento y su experiencia profesional.

---

## 3.4 🟢 Sección nueva 2.6 — Infraestructura y despliegue

Va al final del Capítulo II, antes del Capítulo III. **Es la sección más
importante de las que faltan.**

> ### 2.6 Contenerización, infraestructura y despliegue
>
> #### 2.6.1 Decisión de arquitectura de despliegue
>
> Se evaluaron dos alternativas para llevar el sistema a producción: la ejecución
> directa de los procesos sobre el sistema operativo mediante un gestor de
> procesos, o la contenerización de cada servicio. Se optó por la segunda.
>
> El caso que motivó la decisión ocurrió durante el propio desarrollo: el script
> de ejecución de pruebas dependía de una funcionalidad de expansión de patrones
> presente en Node.js 22 pero ausente en Node.js 20, de modo que funcionaba en
> una máquina del equipo y fallaba en otra. Fijar la versión del entorno de
> ejecución en la definición de la imagen elimina por completo esa clase de
> fallo, y materializa la propiedad que Merkel (2014) identifica como principal
> ventaja de los contenedores: la equivalencia entre el entorno de desarrollo y
> el de producción.
>
> #### 2.6.2 Composición de los servicios
>
> El sistema se despliega sobre una máquina virtual de Google Cloud Platform
> (Compute Engine) con Ubuntu Server, mediante cuatro contenedores orquestados
> con Docker Compose:
>
> | Servicio | Imagen | Réplicas | Puertos publicados | Tareas programadas |
> |---|---|---|---|---|
> | `proxy` | Nginx 1.27 con el frontend compilado | 1 | 80 y 443 | — |
> | `api` | Imagen propia sobre Node 22 Alpine | escalable (1–N) | ninguno | no |
> | `worker` | La misma imagen que `api` | 1 fija | ninguno | sí |
> | `db` | SQL Server 2022 | 1 | ninguno | — |
>
> El contenedor `api` ejecuta la aplicación con un usuario sin privilegios, y no
> publica puertos hacia el exterior: únicamente Nginx es alcanzable desde la red.
> El motor de base de datos tampoco expone su puerto, de modo que solo resulta
> accesible desde la red interna definida por Compose.
>
> La imagen del frontend se construye en varias etapas: una primera etapa compila
> la aplicación con Node y Vite, y la imagen final contiene únicamente Nginx y los
> archivos estáticos resultantes. De este modo, el compilador y el código fuente
> no llegan al servidor de producción.
>
> #### 2.6.3 Separación del proceso de tareas programadas
>
> Ejecutar la tarea de verificación de vencimientos dentro de cada réplica de la
> API provocaría que, con N réplicas activas, el socio recibiera N avisos del
> mismo vencimiento. Para evitarlo, la ejecución de las tareas programadas se
> condiciona a una variable de entorno que solo está activa en el servicio
> `worker`, del cual existe una única instancia. Las réplicas de la API atienden
> peticiones; el worker ejecuta el trabajo de fondo. Ambos comparten la misma
> imagen y el mismo código.
>
> #### 2.6.4 Balanceo de carga y sondas de estado
>
> Nginx actúa simultáneamente como servidor de los archivos estáticos, como proxy
> inverso hacia la API y como balanceador de carga. La resolución del nombre del
> servicio devuelve las direcciones de todas las réplicas activas, entre las que
> el tráfico se reparte por turno rotatorio.
>
> El escalado horizontal de la capa de aplicación es posible **únicamente porque
> la autenticación no guarda estado**: al viajar la identidad del usuario dentro
> del token firmado, cualquier réplica puede atender cualquier petición sin
> necesidad de afinidad de sesión ni de un almacén de sesiones compartido.
>
> Se implementaron dos sondas de estado con propósitos distintos. La sonda de
> vivacidad informa si el proceso responde, sin consultar dependencias externas;
> la sonda de disponibilidad verifica además la conexión con la base de datos.
> Esta separación es deliberada: si ambas consultaran la base de datos, una caída
> del motor marcaría como muertas a todas las réplicas y provocaría su reinicio
> simultáneo, agravando la interrupción en lugar de contenerla.
>
> #### 2.6.5 Persistencia
>
> La información que debe sobrevivir a la destrucción y recreación de los
> contenedores se aloja en volúmenes gestionados por Docker:
>
> | Volumen | Contenido |
> |---|---|
> | `sqldata` | Archivos de datos de la base de datos |
> | `uploads` | Comprobantes de pago, compartidos entre todas las réplicas de la API |
>
> Complementariamente, se implementó un procedimiento de respaldo cifrado de la
> base de datos, en atención a que esta contiene datos personales sujetos a la
> Ley Orgánica de Protección de Datos Personales del Ecuador (2021).
>
> #### 2.6.6 Seguridad de la infraestructura
>
> - El tráfico se cifra con TLS mediante certificados emitidos por Let's Encrypt
>   y renovados automáticamente.
> - El cortafuegos del host admite únicamente los puertos estrictamente
>   necesarios.
> - Los secretos —cadena de conexión, secreto de firma del token y credenciales
>   de correo— se externalizan en variables de entorno excluidas del control de
>   versiones y de la imagen del contenedor.
> - El usuario de base de datos empleado por la aplicación posee permisos mínimos
>   sobre el esquema.
>
> ⚠️ `[VERIFICAR]` Inserta la **Figura 14. Diagrama de despliegue con
> contenedores, red interna y volúmenes**.

---

## 3.5 🔴 Capítulo III completo — reescrito

**Reemplazar todo el Capítulo III por:**

> ## Capítulo III
> ## Pruebas, verificación y estabilización
>
> ### 3.1 Estrategia y plan de pruebas
>
> El presente capítulo detalla los procesos de aseguramiento de la calidad
> ejecutados sobre el sistema. La estrategia se diseñó bajo un enfoque
> progresivo, verificando en primer término el comportamiento aislado de las
> unidades de lógica, para evaluar posteriormente la integración entre la base de
> datos, el servidor y la interfaz gráfica, y finalmente el comportamiento del
> sistema desplegado en su forma definitiva.
>
> Las pruebas no constituyeron una fase terminal, sino una actividad transversal
> incorporada a la Definición de Terminado de cada Sprint. El objetivo principal
> fue garantizar la fiabilidad del sistema y la integridad de las transacciones
> financieras antes de su puesta en producción.
>
> | Nivel | Herramienta | Cantidad | Alcance |
> |---|---|---|---|
> | Pruebas unitarias de la capa de negocio | `node:test` (nativo) | 20 casos | Reglas de acceso al gimnasio, política de contraseñas y validación de campos, construcción de la respuesta de estado |
> | Pruebas unitarias de la capa de presentación | Vitest | 1 archivo | Utilidades del modo de entrenamiento |
> | Análisis estático | ESLint 9 | — | Reglas de los hooks de React y detección de código muerto |
> | Verificación de autorización | Servidor efímero sobre las rutas reales | 16 casos | 11 que deben bloquear el acceso y 5 que deben permitirlo |
> | Verificación del almacenamiento de archivos | Script de comprobación | 8 casos | Tipos permitidos y rechazados, y travesía de directorios |
> | Pruebas de integridad de la base de datos | Scripts sobre el motor | — | Restricciones, disparadores y concurrencia |
> | Pruebas de integración de la API | Postman | — | Contrato de los endpoints y códigos de estado |
> | Verificación del balanceo de carga | Tres réplicas con alias de red | — | Reparto equitativo del tráfico y conmutación ante fallo |
> | Ejecución sobre el artefacto desplegable | `docker compose run api npm test` | 20 casos | La suite se ejecuta dentro de la imagen que llega a producción |
>
> ### 3.2 Pruebas unitarias de la lógica de negocio
>
> Las reglas de negocio del sistema se implementaron como funciones puras que
> reciben sus dependencias por parámetro —incluida la fecha de referencia—, lo
> que las hace deterministas y verificables sin necesidad de levantar el servidor
> ni la base de datos. Sobre ellas se construyeron veinte pruebas unitarias
> automatizadas empleando el módulo de pruebas nativo de Node.js, sin
> dependencias externas.
>
> Las pruebas cubren tres conjuntos de reglas: la evaluación del derecho de
> acceso de un socio al gimnasio, contemplando los casos de suscripción vigente,
> vencida, inexistente, con pago pendiente y de usuario inactivo; la política de
> contraseñas y la validación de campos obligatorios; y la construcción de la
> respuesta de las sondas de estado.
>
> ⚠️ `[VERIFICAR]` Inserta la **Figura 15. Salida de la ejecución de la suite de
> pruebas unitarias**.
>
> ### 3.3 Pruebas de integridad y persistencia de datos
>
> Dado que el núcleo del sistema administra información sensible, se ejecutaron
> pruebas directamente sobre el motor de base de datos:
>
> - **Validación de restricciones.** Se realizaron inserciones deliberadamente
>   erróneas para comprobar que el motor rechazara los estados fuera del dominio
>   permitido y los horarios incoherentes en las clases grupales, verificando que
>   la hora de inicio sea siempre anterior a la de finalización.
> - **Auditoría mediante disparadores.** Se simularon modificaciones sobre el
>   estado de los comprobantes de pago. Se comprobó que el disparador posterior a
>   la actualización capturara el evento de forma transparente para la
>   aplicación, registrando el usuario responsable y la marca de tiempo en la
>   tabla de auditoría.
> - **Bajas lógicas.** Se intentó eliminar planes de suscripción con historial
>   asociado, confirmando que el disparador interceptara el comando y lo
>   transformara en una actualización de estado a inactivo, preservando la
>   integridad referencial y el registro histórico.
> - **Transaccionalidad.** Se verificó que la aprobación de un pago y la
>   correspondiente actualización de la suscripción se confirmen o se deshagan en
>   conjunto, forzando un fallo intermedio y comprobando que la base de datos no
>   quedara en un estado inconsistente.
>
> ### 3.4 Pruebas de seguridad
>
> #### 3.4.1 Verificación de la autorización
>
> Se construyó un procedimiento de verificación que levanta un servidor efímero
> sobre las rutas reales del sistema y ejecuta dieciséis casos de prueba: once
> peticiones que deben ser rechazadas —sin token, con token inválido, con token
> expirado, con un rol no autorizado y sobre recursos ajenos al solicitante— y
> cinco que deben ser admitidas. La verificación comprobó que las primeras
> devolvieran los códigos 401 o 403 según correspondiera, y las segundas el
> código 200.
>
> #### 3.4.2 Prevención de inyección SQL
>
> Empleando Postman se enviaron cargas útiles con sentencias SQL en los campos de
> entrada de los endpoints de autenticación, búsqueda y registro. En ningún caso
> la carga alteró la sentencia ejecutada: la parametrización que aplica el
> controlador `mssql` transporta los valores como parámetros tipados y no como
> fragmentos de la consulta, lo que constituye la mitigación recomendada por
> OWASP (2021) para la categoría A03.
>
> #### 3.4.3 Verificación del almacenamiento de archivos
>
> Se ejecutaron ocho casos sobre el servicio de almacenamiento de comprobantes,
> comprobando que se aceptaran únicamente los tipos MIME de la lista blanca; que
> se rechazaran los archivos HTML y SVG, capaces de ejecutar scripts en el origen
> de la aplicación; que la extensión resultante se derivara del tipo declarado y
> no del nombre enviado por el cliente; y que los intentos de travesía de
> directorios mediante nombres manipulados fueran neutralizados.
>
> ### 3.5 Pruebas de la interfaz de usuario
>
> En la capa de presentación las pruebas se orientaron a la validación del manejo
> del estado de la aplicación:
>
> - **Navegación y modales.** Se evaluó el sistema de pestañas del panel del
>   entrenador, comprobando que la transición entre la agenda semanal y la lista
>   de alumnos ocurriera de forma instantánea y sin recargas de página.
> - **Modo de entrenamiento.** Se verificó exhaustivamente la máquina de estados
>   del componente de seguimiento de rutinas, comprobando que la cola de
>   ejercicios respondiera a la interacción del usuario, que los ejercicios
>   completados desaparecieran de la vista en tiempo real y que al renderizar el
>   resumen final se enviara correctamente la carga útil hacia la base de datos.
> - **Manejo de errores.** Se forzaron caídas controladas del servidor para
>   verificar que la interfaz capturara las excepciones y sustituyera los
>   indicadores de carga por mensajes de error comprensibles, sin que la
>   aplicación quedara bloqueada.
> - **Protección de rutas.** Se comprobó que el acceso directo por URL a un panel
>   privado sin la sesión correspondiente redirigiera al inicio de sesión, y que
>   la manipulación del rol almacenado en el cliente no otorgara acceso efectivo
>   a los datos, al ser rechazada la petición por el servidor.
>
> ### 3.6 Pruebas sobre la infraestructura desplegada
>
> - **Ejecución sobre el artefacto real.** La suite de pruebas se ejecutó dentro
>   de la imagen Docker mediante `docker compose run api npm test`, de modo que
>   la verificación recae sobre el artefacto que efectivamente llega a
>   producción y no únicamente sobre el código presente en la máquina de
>   desarrollo.
> - **Balanceo de carga.** Se levantaron tres réplicas de la API y se emitieron
>   nueve peticiones consecutivas, comprobando un reparto equitativo de tres
>   peticiones por réplica. Posteriormente se detuvo una réplica durante la
>   emisión de tráfico, verificando que el balanceador redirigiera las peticiones
>   a las réplicas restantes sin devolver errores de puerta de enlace.
> - **Persistencia.** Se destruyeron y recrearon los contenedores, comprobando
>   que tanto los datos de la base como los comprobantes almacenados
>   permanecieran intactos gracias a los volúmenes.
> - **Sondas de estado.** Se verificó que, al detener el contenedor de base de
>   datos, la sonda de disponibilidad reportara el fallo mientras la sonda de
>   vivacidad continuara respondiendo, evitando el reinicio simultáneo de todas
>   las réplicas.
>
> ⚠️ `[VERIFICAR]` Inserta la **Figura 16. Evidencia del reparto de peticiones
> entre réplicas**.
>
> ### 3.7 Estabilización y control de versiones
>
> La fase de estabilización abordó la resolución de los conflictos técnicos
> surgidos de la integración del trabajo concurrente del equipo:
>
> - **Resolución de conflictos de fusión.** Se estabilizó el flujo de trabajo en
>   Git resolviendo las colisiones sobre los archivos de mayor concurrencia
>   mediante la evaluación conjunta de los cambios entrantes y locales. La
>   adopción de ramas por integrante e integración exclusiva mediante Pull
>   Request redujo progresivamente la frecuencia de estos conflictos.
> - **Depuración del código.** Se aplicaron las correcciones señaladas por el
>   análisis estático de ESLint, eliminando variables sin uso, dependencias
>   incompletas en los hooks y código inalcanzable.
> - **Reconciliación del esquema de base de datos.** Se verificó la
>   correspondencia entre el esquema versionado en el repositorio y el esquema
>   efectivamente desplegado, incorporando las diferencias como migraciones
>   fechadas.
> - **Unificación de identidades de Git.** El historial registraba varias
>   identidades por desarrollador, originadas en configuraciones distintas entre
>   equipos. Se unificaron para que el reparto real de contribuciones resultara
>   verificable.

---

## 3.6 🟢 Conclusiones

**Reemplazar la página en blanco (p. 29) por:**

> ## Conclusiones
>
> Se desarrolló e implementó un sistema web integral de gestión administrativa y
> deportiva para el gimnasio Slimming Gym & Fitness, sustentado en una
> arquitectura cliente-servidor de tres capas y una base de datos relacional
> centralizada, con lo cual se cumplió el objetivo general planteado. El sistema
> comprende sesenta y nueve endpoints REST, diez tablas normalizadas y
> veinticinco vistas de interfaz distribuidas en un sitio público y tres paneles
> diferenciados por rol, y se encuentra desplegado y operativo.
>
> Respecto del primer objetivo específico, la centralización de la información
> institucional se logró mediante un esquema relacional normalizado hasta la
> tercera forma normal, en el que la integridad no depende de la corrección del
> código de aplicación sino que se impone desde el propio motor: las claves
> foráneas, las restricciones sobre los estados del dominio y los disparadores de
> baja lógica garantizan que un registro con historial asociado no pueda
> eliminarse y que las operaciones que afectan a varias tablas se confirmen o se
> deshagan en conjunto. Con ello, el ciclo de vida del socio —registro,
> suscripción, pago, ingreso y baja— quedó trazable en una única fuente de
> verdad, sustituyendo los registros dispersos que motivaron este trabajo.
>
> Respecto del segundo objetivo específico, la planificación del entrenamiento se
> digitalizó a través de un constructor de rutinas que permite al entrenador
> definir ejercicios con sus variables de carga, asignarlos a cada socio y
> reutilizarlos como plantillas, complementado con un módulo de evaluaciones
> físicas que registra las mediciones periódicas y las representa gráficamente.
> Esta combinación resuelve la limitación central identificada en el diagnóstico:
> el gimnasio pasó de una prescripción de rutinas sin registro consultable a
> disponer de evidencia histórica que permite reconocer el progreso o el
> estancamiento de cada socio.
>
> Respecto del tercer objetivo específico, la plataforma se desplegó sobre una
> infraestructura contenerizada en la nube con proxy inverso, balanceo de carga
> entre réplicas y comunicación cifrada. La contenerización eliminó las
> discrepancias entre los entornos de desarrollo del equipo y el de producción, y
> el escalado horizontal de la capa de aplicación resultó posible por una
> decisión de diseño previa: la autenticación sin estado mediante tokens
> firmados, que permite que cualquier réplica atienda cualquier petición. Los
> controles de seguridad implementados —autorización por rol y por propiedad del
> recurso en la totalidad de los endpoints, consultas parametrizadas en todos los
> accesos a datos, hash de contraseñas con sal individual y validación estricta
> de los archivos recibidos— responden a las categorías de riesgo A01, A02, A03,
> A05 y A07 del OWASP Top 10 (2021).
>
> Desde la perspectiva metodológica, la aplicación de Scrum resultó adecuada a la
> naturaleza del proyecto. Requerimientos significativos como el control de
> ingreso por cédula y el seguimiento de evaluaciones físicas no figuraban en el
> planteamiento inicial y se incorporaron a partir de la retroalimentación
> obtenida en las revisiones de los primeros incrementos, lo que confirma que una
> especificación cerrada al inicio habría producido un sistema menos ajustado a
> la operación real del gimnasio. La integración del código exclusivamente
> mediante Pull Request revisado por pares, evidenciada en treinta y ocho
> solicitudes integradas, constituyó el principal mecanismo de control de calidad
> durante el desarrollo.
>
> Finalmente, la experiencia permitió constatar que las decisiones arquitectónicas
> tomadas en las primeras etapas condicionan de manera determinante la capacidad
> de cambio en las etapas posteriores. La sustitución completa del servicio de
> almacenamiento de comprobantes, ejecutada en una fase avanzada del proyecto,
> requirió modificar un único módulo porque el controlador de pagos consumía una
> interfaz de almacenamiento y no un proveedor concreto. Esa misma migración
> habría implicado una intervención extensa sobre la lógica de negocio de no
> haberse aplicado ese principio de diseño.

---

## 3.7 🟢 Recomendaciones

**Reemplazar la página 30 por:**

> ## Recomendaciones
>
> **Sobre la disponibilidad del servicio.** El balanceo implementado reparte la
> carga entre réplicas alojadas en un mismo host, lo que aporta distribución de
> trabajo, despliegues sin interrupción y tolerancia al fallo de una réplica, pero
> no constituye alta disponibilidad: la máquina virtual permanece como punto
> único de fallo. Se recomienda, en una fase posterior, replicar la aplicación en
> varias máquinas virtuales tras un balanceador externo y trasladar la base de
> datos a una instancia dedicada con replicación.
>
> **Sobre la integración con hardware.** El control de ingreso se opera
> actualmente desde la interfaz web. Dado que la validación de acceso se expone
> como un endpoint independiente que recibe el número de cédula y devuelve un
> veredicto, se recomienda aprovechar ese punto de integración para incorporar
> torniquetes o lectores biométricos, lo que eliminaría la intervención manual en
> recepción sin requerir cambios en la lógica de negocio.
>
> **Sobre la cobertura de pruebas.** Se recomienda ampliar la verificación
> automatizada de la capa de presentación e incorporar pruebas de extremo a
> extremo que ejerciten los flujos completos del usuario, así como integrar la
> ejecución de la suite a un flujo de integración continua que impida incorporar
> a la rama principal cambios que rompan las pruebas existentes.
>
> **Sobre la explotación de la información.** El sistema acumula datos de
> asistencia, pagos y evaluaciones físicas cuyo valor analítico crece con el
> tiempo. Se recomienda desarrollar un módulo de inteligencia de negocio que
> permita identificar patrones de deserción, estacionalidad de la asistencia y
> efectividad de los distintos tipos de rutina.
>
> **Sobre la evolución funcional.** Se recomienda completar la interfaz de
> administración de permisos de entrenador, cuya tabla y endpoints ya existen;
> integrar una pasarela de pago en línea aprovechando el punto de integración ya
> implementado; y evaluar el desarrollo de una aplicación móvil para el socio,
> viable sin reescribir la lógica de negocio dado que la API REST es
> independiente del cliente que la consume.
>
> **Sobre la protección de datos.** Considerando que el sistema administra datos
> personales y de salud, se recomienda formalizar una política de retención y
> eliminación de datos, verificar periódicamente la restauración de los respaldos
> cifrados y documentar el tratamiento de la información conforme a la Ley
> Orgánica de Protección de Datos Personales del Ecuador.

---

## 3.8 🟢 Referencias bibliográficas

⚠️ `[VERIFICAR]` Confirma la edición y el año de los libros impresos que
efectivamente consultes; el resto son fuentes en línea verificables.

> ## Referencias bibliográficas
>
> Docker Inc. (2024). *Docker documentation*. https://docs.docker.com/
>
> Elmasri, R., & Navathe, S. B. (2016). *Fundamentals of database systems*
> (7.ª ed.). Pearson.
>
> Fielding, R. T. (2000). *Architectural styles and the design of network-based
> software architectures* [Tesis doctoral, University of California, Irvine].
> https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm
>
> Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1995). *Design patterns:
> Elements of reusable object-oriented software*. Addison-Wesley.
>
> International Organization for Standardization. (2011). *ISO/IEC 25010:2011.
> Systems and software engineering — Systems and software Quality Requirements
> and Evaluation (SQuaRE) — System and software quality models*.
>
> Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Token (JWT)*
> (RFC 7519). Internet Engineering Task Force.
> https://doi.org/10.17487/RFC7519
>
> Ley Orgánica de Protección de Datos Personales, Registro Oficial Suplemento
> 459 (2021). Asamblea Nacional del Ecuador.
>
> Merkel, D. (2014). Docker: Lightweight Linux containers for consistent
> development and deployment. *Linux Journal, 2014*(239).
>
> Meta Platforms. (2025). *React documentation*. https://react.dev/
>
> Microsoft. (2025). *SQL Server documentation*.
> https://learn.microsoft.com/sql/
>
> OpenJS Foundation. (2025). *Node.js documentation*. https://nodejs.org/docs/
>
> OWASP Foundation. (2021). *OWASP Top 10:2021 — The ten most critical web
> application security risks*. https://owasp.org/Top10/
>
> Pressman, R. S., & Maxim, B. R. (2020). *Ingeniería del software: Un enfoque
> práctico* (9.ª ed.). McGraw-Hill.
>
> Provos, N., & Mazières, D. (1999). A future-adaptable password scheme. En
> *Proceedings of the USENIX Annual Technical Conference* (pp. 81-91). USENIX
> Association.
>
> Schwaber, K., & Sutherland, J. (2020). *La Guía de Scrum: La guía definitiva
> de Scrum, las reglas del juego*. https://scrumguides.org/
>
> Sommerville, I. (2011). *Ingeniería de software* (9.ª ed.). Pearson Educación.

---

## 3.9 🟢 Anexos

> ## Anexos
>
> - **Anexo A.** Catálogo completo de los sesenta y nueve endpoints de la API,
>   con su método HTTP, su ruta y los roles autorizados.
> - **Anexo B.** Matriz de permisos por rol.
> - **Anexo C.** Diccionario de datos de las diez tablas del esquema.
> - **Anexo D.** Script de creación del esquema de la base de datos.
> - **Anexo E.** Manual de despliegue reproducible del sistema.
> - **Anexo F.** Manual de usuario por perfil.
> - **Anexo G.** Evidencia de la aplicación de Scrum: tablero de Jira e historial
>   de Pull Requests.
> - **Anexo H.** Evidencia de la ejecución de las pruebas automatizadas.
> - **Anexo I.** Fragmentos de código representativos: cadena de middleware de
>   autorización, regla de acceso al gimnasio y definición de los servicios en
>   Docker Compose.
> - **Anexo J.** Capturas de la interfaz por perfil de usuario.

---

# PARTE 4 — Listas de tablas y figuras

## 🟢 Lista de tablas (reemplaza la p. 5)

> ## Lista de tablas
>
> Tabla 1. Requisitos no funcionales según ISO/IEC 25010
> Tabla 2. Tecnologías de la capa de presentación
> Tabla 3. Tecnologías de la capa de lógica de negocio
> Tabla 4. Tecnologías de infraestructura y despliegue
> Tabla 5. Herramientas de desarrollo y calidad
> Tabla 6. Indicadores de ejecución del proyecto
> Tabla 7. Tablas del esquema de base de datos
> Tabla 8. Estados canónicos del dominio
> Tabla 9. Módulos funcionales y endpoints implementados
> Tabla 10. Servicios contenerizados del despliegue
> Tabla 11. Volúmenes de persistencia
> Tabla 12. Niveles y alcance de las pruebas ejecutadas

## 🟢 Lista de figuras (reemplaza la p. 6)

> ## Lista de figuras
>
> Figura 1. Arquitectura de tres capas del sistema
> Figura 2. Cadena de procesamiento de una petición
> Figura 3. Diagrama de casos de uso
> Figura 4. Diagrama de clases
> Figura 5. Diagrama entidad-relación
> Figura 6. Diagrama de despliegue
> Figura 7. Estructura de directorios del repositorio
> Figura 8. Esquema de la base de datos implementado
> Figura 9. Panel del entrenador con navegación por pestañas
> Figura 10. Pantalla de control de ingreso
> Figura 11. Verificación de un comprobante de pago
> Figura 12. Constructor de rutinas del entrenador
> Figura 13. Registro de evaluación física e historial de progreso
> Figura 14. Diagrama de despliegue con contenedores y volúmenes
> Figura 15. Salida de la ejecución de la suite de pruebas unitarias
> Figura 16. Evidencia del reparto de peticiones entre réplicas

**Formato APA 7 para cada figura en el cuerpo del documento:**

```
Figura 9                                    ← negrita, sobre la imagen
Panel del entrenador con navegación por pestañas   ← cursiva, debajo del número

[imagen]

Nota. Elaboración propia.                   ← "Nota." en cursiva, al pie
```

---

# PARTE 5 — Estructura final que debe tener el documento

```
PRELIMINARES (numeración romana: i, ii, iii…)
  Portada
  Declaración y autorización (3 páginas, una por autor)
  Dedicatoria
  Agradecimientos
  Resumen + palabras clave
  Abstract + keywords
  Tabla de contenidos
  Lista de tablas
  Lista de figuras

CUERPO (numeración arábiga desde 1)
  Introducción
  Planteamiento del problema
  Objetivos (general y específicos)

  Capítulo I — Levantamiento de requisitos y diseño del sistema
    1.1 Levantamiento de requisitos
        Requisitos funcionales (11 épicas)
        Requisitos no funcionales (RNF-01 a RNF-13)
    1.2 Diseño del sistema
        1.2.1 Arquitectura general
        1.2.2 Modelado del sistema
    1.3 Herramientas y tecnologías utilizadas
        1.3.1 Capa de presentación
        1.3.2 Capa de lógica de negocio
        1.3.3 Capa de datos
        1.3.4 Infraestructura y despliegue
        1.3.5 Herramientas de desarrollo y calidad
    1.4 Marco de trabajo metodológico
    1.5 Limitaciones del sistema

  Capítulo II — Construcción del sistema
    2.1 Estructura general del proyecto
    2.2 Implementación de la capa de datos
    2.3 Implementación de la capa de lógica de negocio
    2.4 Implementación de la capa de presentación
    2.5 Integración de módulos
    2.6 Contenerización, infraestructura y despliegue   ← NUEVA

  Capítulo III — Pruebas, verificación y estabilización
    3.1 Estrategia y plan de pruebas
    3.2 Pruebas unitarias de la lógica de negocio
    3.3 Pruebas de integridad y persistencia de datos
    3.4 Pruebas de seguridad
    3.5 Pruebas de la interfaz de usuario
    3.6 Pruebas sobre la infraestructura desplegada
    3.7 Estabilización y control de versiones

  Conclusiones
  Recomendaciones
  Referencias bibliográficas
  Anexos
```

---

# PARTE 6 — Datos que debes confirmar antes de entregar

| Dato | Estado |
|---|---|
| Número de Sprints ejecutados | El repositorio registra migraciones hasta el Sprint 8 — confirmar en Jira |
| Fechas de inicio y cierre de cada Sprint | Tomarlas de Jira |
| Roles de Scrum asumidos por cada integrante | Definir en equipo |
| Commits totales | 146 en todas las ramas; 130 en la rama de trabajo actual |
| Edición y año de Pressman y de Sommerville | Confirmar con el ejemplar que consulten |
| Capturas de pantalla de las 16 figuras | Pendientes |
| Diagramas UML (casos de uso, clases, ER, despliegue) | Mencionados en el borrador pero no insertados |
