# Prompts de corrección — interfaz y datos del sitio

Cada bloque es independiente y está pensado para entregarse a la IA **de uno en
uno**, en sesiones distintas. Todos incluyen la ruta de los archivos y la causa
técnica ya diagnosticada, para que no haya que volver a investigarla.

Orden recomendado: 1 → 2 → 3 → 4. El primero es el que más se nota en pantalla.

Contexto común del proyecto (ya va incluido en cada prompt):

- Frontend React 19 + Vite, en `frontend-gimnasio/`
- Alias `@` → `frontend-gimnasio/src`
- CSS plano por componente, un `.css` junto a cada `.jsx`
- Panel del socio: `src/pages/admin/Member.jsx`
- Comprobar con `npm run build` antes de dar por terminado

---

## Prompt 1 — Maquetación del panel del socio

```
Trabajas en el frontend de Slimming Gym Fitness: React 19 + Vite en la carpeta
frontend-gimnasio/, con alias @ apuntando a src/ y una hoja .css por componente.

Corrige tres defectos de maquetación del panel del socio. La causa de cada uno
ya está diagnosticada; verifícala antes de aplicar el cambio.

DEFECTO 1 — Franjas negras a los lados en pantallas grandes
Archivo: src/pages/admin/Member.css
La regla .member-dashboard fija max-width: 1200px con margin: 0 auto y aplica
background-color: #0b0f19 sobre ese bloque centrado. En monitores anchos el
fondo del panel solo cubre esos 1200px y a los costados asoma el fondo del
contenedor padre, lo que se ve como dos franjas negras.
Arregla el fondo para que cubra todo el ancho de la ventana y deja el límite de
1200px solo para el contenido. No cambies el ancho del contenido.

DEFECTO 2 — Los modales aparecen desplazados hacia abajo, no centrados
Archivos: src/components/common/Modal.jsx, src/components/common/Modal.css,
          src/pages/admin/Member.css
Causa: .tab-content-area (Member.css) aplica una animación cuyos fotogramas usan
transform: translateY(...) con animation-fill-mode: forwards. Un elemento con
transform se convierte en el bloque contenedor de sus descendientes con
position: fixed, así que el backdrop del modal deja de posicionarse respecto a
la ventana y pasa a hacerlo respecto al área de contenido, que está desplazada
hacia abajo por la barra de pestañas.
Arreglo pedido: renderizar el modal mediante createPortal de react-dom sobre
document.body, de modo que quede fuera de cualquier ancestro con transform.
Es la solución de fondo: sirve para todos los modales, presentes y futuros,
sin importar dónde se invoquen.
Comprueba que el modal quede centrado vertical y horizontalmente tanto en
escritorio como en móvil (375 px de ancho), y que siga cerrándose al pulsar el
fondo o la tecla Escape.
El modal afectado que sirve de prueba es "Registrar Nuevas Medidas Corporales",
en src/features/member/components/ProgressChart.jsx.

DEFECTO 3 — Las opciones de pago quedan descuadradas en escritorio
Archivos: src/features/member/components/Payments.css,
          src/features/member/components/PaypalCheckout.css
El bloque de método de pago, el botón "Confirmar y Registrar Pago" y los botones
de PayPal deben quedar centrados y con un ancho máximo legible (alrededor de
600 px) en pantallas grandes, en lugar de estirarse de borde a borde. En móvil
deben seguir ocupando el ancho disponible.

Restricciones:
- Solo CSS y el cambio a createPortal. No modifiques la lógica de negocio ni las
  llamadas a la API.
- No toques los colores ni la tipografía: el tema oscuro actual se mantiene.
- Al terminar ejecuta `npm run build` en frontend-gimnasio/ y confirma que
  compila sin errores.
```

---

## Prompt 2 — Navegación y textos de la interfaz

```
Trabajas en el frontend de Slimming Gym Fitness: React 19 + Vite en la carpeta
frontend-gimnasio/, con alias @ apuntando a src/. La navegación usa react-router.

DEFECTO 1 — La barra lateral marca dos opciones activas a la vez
Archivo: src/components/layout/AdminSidebar.jsx (alrededor de la línea 210)
Los enlaces se pintan con
  <NavLink className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
Sin la propiedad `end`, NavLink considera activa cualquier ruta que empiece por
su destino. El enlace de inicio apunta a la raíz del panel, así que al entrar en
cualquier subsección quedan iluminados dos elementos: el de la casa y el actual.
Añade `end` a los enlaces cuya ruta es prefijo de otras (como mínimo el de
inicio) y verifica navegando por todas las secciones que solo se resalte una.
Revisa también los submenús: usan una comparación manual con location.pathname +
location.search, que debe seguir funcionando igual.

CAMBIO 2 — Texto de la pestaña del panel del socio
Archivo: src/pages/admin/Member.jsx (alrededor de la línea 160)
La pestaña dice "Rutina en PDF". Debe decir solo "Rutina". Mantén el icono.

CAMBIO 3 — Etiqueta del documento de identidad
El formulario de registro pide "ID Número", que no se entiende. Debe decir
"Número de cédula o pasaporte".
Busca todas las apariciones de esa etiqueta en la interfaz, no solo la del
registro: aparece al menos en src/pages/login/Login.jsx, y hay formularios de
alta y edición de usuarios en src/pages/admin/dashboard/AdminDashboard.jsx y
src/pages/admin/accesos/AdminAccesos.jsx.
Cambia únicamente el texto visible y el placeholder. El nombre del campo que
viaja al backend es IDNumber y NO debe tocarse: la API y la base de datos lo
esperan así.

Restricciones:
- No cambies rutas ni nombres de campos del formulario.
- Al terminar ejecuta `npm run build` en frontend-gimnasio/ y confirma que
  compila sin errores.
```

---

## Prompt 3 — Mostrar/ocultar contraseña

```
Trabajas en el frontend de Slimming Gym Fitness: React 19 + Vite en la carpeta
frontend-gimnasio/, con alias @ apuntando a src/. Los iconos vienen de
react-icons (ya es dependencia del proyecto; usa FaEye y FaEyeSlash de
react-icons/fa, que es el juego que emplea el resto de la interfaz).

Tarea: que todos los campos de contraseña de la aplicación tengan un botón de
ojo para alternar entre texto oculto y visible.

Enfoque pedido: crea un componente reutilizable en
src/components/common/PasswordInput.jsx (con su PasswordInput.css) que envuelva
un <input> y muestre el botón dentro del campo, alineado a la derecha. Debe
aceptar las mismas props que un input normal (value, onChange, name, placeholder,
required, autoComplete...) y reenviarlas al input real. Después sustituye por él
todos los campos de contraseña existentes.

Archivos con campos de contraseña que hay que migrar:
- src/pages/login/Login.jsx (inicio de sesión y registro)
- src/pages/login/ForgotPassword.jsx
- src/pages/login/ResetPassword.jsx
- src/features/member/components/UserProfile.jsx (cambio de contraseña)
Busca además cualquier otro type="password" que quede suelto en src/ y migra
también esos.

Requisitos de accesibilidad y comportamiento:
- El botón debe ser un <button type="button"> para que no envíe el formulario.
- Necesita aria-label que cambie entre "Mostrar contraseña" y "Ocultar
  contraseña", y title con el mismo texto.
- Cada campo mantiene su propio estado: mostrar uno no debe revelar los demás.
- El estado arranca siempre oculto, también al recargar la página.
- El icono no debe tapar el texto que se escribe: reserva espacio a la derecha
  del input.
- Debe verse bien en móvil (375 px) y respetar el tema oscuro actual.

Restricciones:
- No cambies la lógica de autenticación ni las llamadas a la API.
- No añadas dependencias nuevas.
- Al terminar ejecuta `npm run build` en frontend-gimnasio/ y confirma que
  compila sin errores.
```

---

## Prompt 4 — Datos reales del gimnasio

```
Trabajas en el frontend de Slimming Gym Fitness: React 19 + Vite en la carpeta
frontend-gimnasio/, con alias @ apuntando a src/.

Tarea: reemplazar los datos de contacto de relleno por los reales del negocio.

Archivo central: src/config/site.js
Hoy contiene valores inventados ("Av. Principal #123", "+593 99 999 9999"). Ese
objeto siteConfig ya lo consume el pie de página de src/pages/home/Home.jsx.

Datos reales confirmados por el cliente:
- Nombre: SLIMMING Gym & Fitness
- Trayectoria: más de 20 años en el mercado de gimnasios
- Dirección: N60 y Avenida Eloy Alfaro, Quito, Ecuador 170513
- Instagram: https://www.instagram.com/slimminggym/?hl=es

Datos SIN confirmar: teléfono, correo y horarios de atención. NO los inventes.
Déjalos como están y marca cada uno con un comentario
// TODO: confirmar con el cliente
para que se completen antes de publicar. Si el cliente te los facilita en el
mismo encargo, úsalos.

Trabajo a realizar:
1. Actualiza siteConfig con los datos confirmados y añade un campo `social` con
   el enlace de Instagram, y un campo `description` con la trayectoria.
2. Añade al pie de página de Home.jsx un enlace a Instagram con su icono
   (FaInstagram de react-icons/fa, ya usado en el proyecto). Debe abrirse en una
   pestaña nueva con rel="noopener noreferrer".
3. Revisa src/pages/sobrenossotros/ y sustituye cualquier texto de relleno por
   la descripción real del gimnasio: establecimiento con más de 20 años de
   trayectoria en Quito. No inventes historia, premios, número de socios ni
   servicios que no estén documentados.
4. Busca en todo src/ cadenas de relleno que hayan quedado sueltas ("Av.
   Principal", "999 9999", "lorem", "example.com") y hazlas apuntar a
   siteConfig en lugar de repetir el valor a mano.

Restricciones:
- Todo dato de contacto debe salir de siteConfig, nunca escrito directamente en
  un componente.
- No inventes ningún dato del negocio. Si falta algo, déjalo con el TODO.
- Al terminar ejecuta `npm run build` en frontend-gimnasio/ y confirma que
  compila sin errores.
```

---

## Nota sobre los datos del gimnasio

La dirección, la trayectoria y el Instagram los confirmó el cliente.

Una búsqueda pública devolvió además un teléfono (`+593 98 851 8398`) y un
horario de atención continuo, pero **no están verificados**: la fuente que los
publicaba redirige hoy a un dominio de spam, y el resumen del buscador pudo
mezclar datos de otro gimnasio de la misma avenida. Confírmalos con el cliente
antes de publicarlos; el prompt 4 está escrito para dejarlos pendientes en lugar
de arriesgar un dato de contacto equivocado en producción.
