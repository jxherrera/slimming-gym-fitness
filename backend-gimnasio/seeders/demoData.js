/**
 * Catalogos de datos para el poblado de demostracion.
 *
 * Se mantienen separados del sembrador para poder revisarlos (y traducirlos o
 * ampliarlos) sin tocar la logica de insercion. Los nombres, ejercicios y
 * clases corresponden a un gimnasio real del Ecuador: la idea es que las
 * pantallas se vean como en produccion, no como una tabla de "Usuario 1".
 */

// Dominio reservado para los usuarios generados. Es el unico marcador que
// identifica los datos de demostracion, y de el depende que `--limpiar` pueda
// borrarlos sin tocar los usuarios reales del sistema.
const DOMINIO_DEMO = 'demo.slimminggym.com';

// Contrasena unica para todas las cuentas generadas. Cumple la politica de
// validators.js (8+ caracteres, al menos una letra y un numero).
const PASSWORD_DEMO = 'Gimnasio2026';

const COACHES = [
    {
        nombres: 'Andrés',
        apellidos: 'Villacís Naranjo',
        especialidad: 'Hipertrofia y fuerza',
        permisos: { editarRutinasAjenas: 1, gestionarPlanes: 1, enviarMensajes: 1 }
    },
    {
        nombres: 'Gabriela',
        apellidos: 'Moreta Salazar',
        especialidad: 'Acondicionamiento y pérdida de peso',
        permisos: { editarRutinasAjenas: 0, gestionarPlanes: 0, enviarMensajes: 1 }
    },
    {
        nombres: 'Kevin',
        apellidos: 'Zambrano Ordóñez',
        especialidad: 'Entrenamiento funcional',
        permisos: { editarRutinasAjenas: 0, gestionarPlanes: 0, enviarMensajes: 0 }
    }
];

// Administrador adicional (recepcion). Permite probar el panel sin usar la
// cuenta maestra creada por seedRunner.js.
const ADMINISTRADORES = [
    { nombres: 'Daniela', apellidos: 'Cevallos Peña' }
];

/**
 * Socios. `perfil` decide el estado de su membresia y lo consume
 * demoDataSeeder.js:
 *
 *   vigente    membresia activa y pagada
 *   porVencer  activa, vence en pocos dias (alimenta el aviso automatico)
 *   vencida    termino y no ha renovado
 *   pendiente  subio el comprobante y espera aprobacion del administrador
 *   rechazado  su comprobante fue rechazado
 *   inactivo   cuenta dada de baja
 */
const SOCIOS = [
    { nombres: 'María Fernanda', apellidos: 'Guerrero Andrade', perfil: 'vigente', renovaciones: 3 },
    { nombres: 'Jorge Luis', apellidos: 'Paredes Cabrera', perfil: 'vigente', renovaciones: 2 },
    { nombres: 'Silvia', apellidos: 'Tapia Jaramillo', perfil: 'vigente', renovaciones: 1 },
    { nombres: 'Christian', apellidos: 'Loor Mendoza', perfil: 'vigente', renovaciones: 0 },
    { nombres: 'Ana Belén', apellidos: 'Yépez Cruz', perfil: 'vigente', renovaciones: 2 },
    { nombres: 'Diego Armando', apellidos: 'Chalco Rivera', perfil: 'vigente', renovaciones: 1 },
    { nombres: 'Verónica', apellidos: 'Sánchez Palacios', perfil: 'vigente', renovaciones: 4 },
    { nombres: 'Luis Alberto', apellidos: 'Bermeo Quintana', perfil: 'vigente', renovaciones: 0 },
    { nombres: 'Karla Estefanía', apellidos: 'Espinoza Vaca', perfil: 'vigente', renovaciones: 1 },
    { nombres: 'Byron', apellidos: 'Chicaiza Toapanta', perfil: 'vigente', renovaciones: 2 },
    { nombres: 'Michelle', apellidos: 'Alvarado Solórzano', perfil: 'vigente', renovaciones: 0 },
    { nombres: 'Santiago', apellidos: 'Ramírez Cedeño', perfil: 'vigente', renovaciones: 3 },
    { nombres: 'Paola Cristina', apellidos: 'Zurita Benavides', perfil: 'vigente', renovaciones: 1 },
    { nombres: 'Marco Antonio', apellidos: 'Cordero Reinoso', perfil: 'vigente', renovaciones: 0 },

    { nombres: 'Jessica', apellidos: 'Manobanda Freire', perfil: 'porVencer', diasRestantes: 3, renovaciones: 2 },
    { nombres: 'Wilson', apellidos: 'Caicedo Angulo', perfil: 'porVencer', diasRestantes: 6, renovaciones: 1 },
    { nombres: 'Doménica', apellidos: 'Ponce Vera', perfil: 'porVencer', diasRestantes: 2, renovaciones: 0 },

    { nombres: 'Fabián', apellidos: 'Suárez Montenegro', perfil: 'vencida', diasVencida: 12, renovaciones: 2 },
    { nombres: 'Katty', apellidos: 'Villamar Bravo', perfil: 'vencida', diasVencida: 45, renovaciones: 1 },
    { nombres: 'Edwin', apellidos: 'Quishpe Iza', perfil: 'vencida', diasVencida: 8, renovaciones: 0 },
    { nombres: 'Alexandra', apellidos: 'Muñoz Grijalva', perfil: 'vencida', diasVencida: 73, renovaciones: 3 },

    { nombres: 'Ricardo', apellidos: 'Salgado Ontaneda', perfil: 'pendiente' },
    { nombres: 'Nataly', apellidos: 'Herrera Buitrón', perfil: 'pendiente' },
    { nombres: 'Joel', apellidos: 'Macías Intriago', perfil: 'pendiente' },

    { nombres: 'Gustavo', apellidos: 'Tinoco Aguirre', perfil: 'rechazado' },

    { nombres: 'Andrea', apellidos: 'Cuenca Robalino', perfil: 'inactivo' },
    { nombres: 'Patricio', apellidos: 'Endara Lascano', perfil: 'inactivo' }
];

// Objetivos que un entrenador escribiria de verdad en la ficha del socio.
const OBJETIVOS = [
    'Bajar 6 kg de grasa en 3 meses manteniendo masa muscular',
    'Ganar masa muscular en tren superior',
    'Mejorar resistencia cardiovascular para media maratón',
    'Fortalecer zona lumbar y corregir postura',
    'Tonificar y definir para el verano',
    'Recuperar condición física tras lesión de rodilla',
    'Aumentar fuerza en sentadilla y peso muerto',
    'Reducir medida de cintura y mejorar movilidad'
];

const NOMBRES_RUTINA = [
    'Full Body 3 días',
    'Push Pull Legs',
    'Hipertrofia 4 días',
    'Torso - Pierna',
    'Adelgazamiento HIIT',
    'Fuerza básica',
    'Funcional intermedio',
    'Acondicionamiento general'
];

// Catalogo de ejercicios. El grupo muscular alimenta los filtros del creador
// de rutinas.
const EJERCICIOS = [
    { nombre: 'Sentadilla libre', grupo: 'Piernas', descripcion: 'Barra sobre trapecios, bajar hasta paralelo controlando la espalda recta.' },
    { nombre: 'Prensa de piernas', grupo: 'Piernas', descripcion: 'Empuje con pies a la anchura de hombros, sin bloquear rodillas.' },
    { nombre: 'Peso muerto', grupo: 'Espalda', descripcion: 'Cadera atrás, espalda neutra, barra pegada a las piernas.' },
    { nombre: 'Zancadas con mancuernas', grupo: 'Piernas', descripcion: 'Paso largo, rodilla trasera cerca del piso, torso erguido.' },
    { nombre: 'Extensión de cuádriceps', grupo: 'Piernas', descripcion: 'Movimiento controlado, pausa de un segundo arriba.' },
    { nombre: 'Curl femoral acostado', grupo: 'Piernas', descripcion: 'Cadera pegada al banco, sin impulso lumbar.' },
    { nombre: 'Press de banca', grupo: 'Pecho', descripcion: 'Escápulas retraídas, barra a la altura del pecho.' },
    { nombre: 'Press inclinado con mancuernas', grupo: 'Pecho', descripcion: 'Banco a 30°, recorrido completo sin chocar mancuernas.' },
    { nombre: 'Aperturas en polea', grupo: 'Pecho', descripcion: 'Codos ligeramente flexionados, apretar al centro.' },
    { nombre: 'Fondos en paralelas', grupo: 'Pecho', descripcion: 'Torso ligeramente inclinado al frente, bajar hasta 90°.' },
    { nombre: 'Dominadas', grupo: 'Espalda', descripcion: 'Agarre prono, llevar el pecho a la barra sin balanceo.' },
    { nombre: 'Remo con barra', grupo: 'Espalda', descripcion: 'Torso a 45°, tirar hacia el ombligo.' },
    { nombre: 'Jalón al pecho', grupo: 'Espalda', descripcion: 'Bajar la barra al pecho, codos hacia el piso.' },
    { nombre: 'Remo en polea baja', grupo: 'Espalda', descripcion: 'Espalda fija, apretar escápulas al final.' },
    { nombre: 'Press militar', grupo: 'Hombros', descripcion: 'De pie, core activo, sin arquear la lumbar.' },
    { nombre: 'Elevaciones laterales', grupo: 'Hombros', descripcion: 'Subir hasta la altura del hombro, sin impulso.' },
    { nombre: 'Pájaros con mancuernas', grupo: 'Hombros', descripcion: 'Torso inclinado, abrir hasta la línea de los hombros.' },
    { nombre: 'Curl de bíceps con barra', grupo: 'Brazos', descripcion: 'Codos pegados al torso, bajada controlada.' },
    { nombre: 'Curl martillo', grupo: 'Brazos', descripcion: 'Agarre neutro, trabaja braquial y antebrazo.' },
    { nombre: 'Extensión de tríceps en polea', grupo: 'Brazos', descripcion: 'Codos fijos, extensión completa.' },
    { nombre: 'Press francés', grupo: 'Brazos', descripcion: 'Barra Z, bajar hacia la frente sin mover los codos.' },
    { nombre: 'Plancha abdominal', grupo: 'Core', descripcion: 'Cuerpo en línea recta, glúteo y abdomen contraídos.' },
    { nombre: 'Crunch en polea', grupo: 'Core', descripcion: 'Flexionar la columna, no la cadera.' },
    { nombre: 'Elevación de piernas colgado', grupo: 'Core', descripcion: 'Sin balanceo, subir hasta la cadera.' },
    { nombre: 'Burpees', grupo: 'Funcional', descripcion: 'Pecho al piso, salto con palmada arriba.' },
    { nombre: 'Battle ropes', grupo: 'Funcional', descripcion: 'Olas alternas, rodillas semiflexionadas.' },
    { nombre: 'Kettlebell swing', grupo: 'Funcional', descripcion: 'Impulso de cadera, brazos relajados.' },
    { nombre: 'Caminadora - trote continuo', grupo: 'Cardio', descripcion: 'Ritmo moderado, respiración controlada.' },
    { nombre: 'Bicicleta estática', grupo: 'Cardio', descripcion: 'Resistencia media, cadencia constante.' },
    { nombre: 'Remo ergómetro', grupo: 'Cardio', descripcion: 'Secuencia piernas - tronco - brazos.' }
];

// Plantillas de rutina por entrenador. El indice de `coach` corresponde al
// arreglo COACHES.
const PLANTILLAS = [
    {
        coach: 0,
        nombre: 'Hipertrofia 4 días - Intermedio',
        objetivo: 'Ganancia de masa muscular en 12 semanas',
        ejercicios: [
            { nombre: 'Press de banca', series: 4, reps: 8, peso: 60, dia: 'Lunes' },
            { nombre: 'Press inclinado con mancuernas', series: 3, reps: 10, peso: 22, dia: 'Lunes' },
            { nombre: 'Fondos en paralelas', series: 3, reps: 12, peso: null, dia: 'Lunes' },
            { nombre: 'Dominadas', series: 4, reps: 8, peso: null, dia: 'Martes' },
            { nombre: 'Remo con barra', series: 4, reps: 10, peso: 45, dia: 'Martes' },
            { nombre: 'Curl de bíceps con barra', series: 3, reps: 12, peso: 25, dia: 'Martes' },
            { nombre: 'Sentadilla libre', series: 4, reps: 8, peso: 80, dia: 'Jueves' },
            { nombre: 'Prensa de piernas', series: 3, reps: 12, peso: 140, dia: 'Jueves' },
            { nombre: 'Press militar', series: 4, reps: 10, peso: 35, dia: 'Viernes' },
            { nombre: 'Elevaciones laterales', series: 3, reps: 15, peso: 8, dia: 'Viernes' }
        ]
    },
    {
        coach: 1,
        nombre: 'Pérdida de grasa - 3 días',
        objetivo: 'Reducción de porcentaje graso con trabajo metabólico',
        ejercicios: [
            { nombre: 'Caminadora - trote continuo', series: 1, reps: 20, peso: null, dia: 'Lunes' },
            { nombre: 'Sentadilla libre', series: 3, reps: 15, peso: 30, dia: 'Lunes' },
            { nombre: 'Jalón al pecho', series: 3, reps: 15, peso: 30, dia: 'Lunes' },
            { nombre: 'Kettlebell swing', series: 4, reps: 20, peso: 12, dia: 'Miércoles' },
            { nombre: 'Burpees', series: 4, reps: 12, peso: null, dia: 'Miércoles' },
            { nombre: 'Plancha abdominal', series: 3, reps: 45, peso: null, dia: 'Miércoles' },
            { nombre: 'Bicicleta estática', series: 1, reps: 25, peso: null, dia: 'Viernes' },
            { nombre: 'Zancadas con mancuernas', series: 3, reps: 12, peso: 10, dia: 'Viernes' }
        ]
    },
    {
        coach: 2,
        nombre: 'Funcional para principiantes',
        objetivo: 'Adaptación anatómica y técnica básica',
        ejercicios: [
            { nombre: 'Sentadilla libre', series: 3, reps: 12, peso: 20, dia: 'Martes' },
            { nombre: 'Remo en polea baja', series: 3, reps: 12, peso: 25, dia: 'Martes' },
            { nombre: 'Plancha abdominal', series: 3, reps: 30, peso: null, dia: 'Martes' },
            { nombre: 'Battle ropes', series: 4, reps: 30, peso: null, dia: 'Jueves' },
            { nombre: 'Zancadas con mancuernas', series: 3, reps: 10, peso: 8, dia: 'Jueves' },
            { nombre: 'Remo ergómetro', series: 1, reps: 15, peso: null, dia: 'Sábado' },
            { nombre: 'Elevación de piernas colgado', series: 3, reps: 12, peso: null, dia: 'Sábado' }
        ]
    },
    {
        coach: 0,
        nombre: 'Fuerza básica 5x5',
        objetivo: 'Progresión de carga en movimientos compuestos',
        ejercicios: [
            { nombre: 'Sentadilla libre', series: 5, reps: 5, peso: 90, dia: 'Lunes' },
            { nombre: 'Press de banca', series: 5, reps: 5, peso: 70, dia: 'Lunes' },
            { nombre: 'Peso muerto', series: 5, reps: 5, peso: 110, dia: 'Miércoles' },
            { nombre: 'Press militar', series: 5, reps: 5, peso: 40, dia: 'Miércoles' },
            { nombre: 'Remo con barra', series: 5, reps: 5, peso: 55, dia: 'Viernes' }
        ]
    }
];

// Clases grupales. `hora` es hora local de Ecuador en formato 24h.
const CLASES = [
    { nombre: 'Spinning matutino', coach: 1, hora: 6, duracionMin: 50, cupo: 20, descripcion: 'Ciclo indoor de alta intensidad con música. Trae toalla y botella de agua.' },
    { nombre: 'Zumba', coach: 1, hora: 18, duracionMin: 60, cupo: 30, descripcion: 'Baile aeróbico para quemar calorías. Apto para todo nivel.' },
    { nombre: 'CrossTraining', coach: 2, hora: 7, duracionMin: 60, cupo: 15, descripcion: 'Circuito funcional de fuerza y resistencia. Nivel intermedio.' },
    { nombre: 'Funcional express', coach: 2, hora: 12, duracionMin: 45, cupo: 18, descripcion: 'Sesión corta de cuerpo completo en la hora del almuerzo.' },
    { nombre: 'Yoga y estiramiento', coach: 1, hora: 19, duracionMin: 60, cupo: 25, descripcion: 'Movilidad, respiración y relajación al cierre del día.' },
    { nombre: 'Fuerza guiada', coach: 0, hora: 17, duracionMin: 60, cupo: 12, descripcion: 'Técnica de sentadilla, press y peso muerto con corrección personalizada.' },
    { nombre: 'GAP (glúteo, abdomen y pierna)', coach: 1, hora: 20, duracionMin: 45, cupo: 22, descripcion: 'Tonificación localizada del tren inferior.' },
    { nombre: 'HIIT nocturno', coach: 2, hora: 20, duracionMin: 40, cupo: 16, descripcion: 'Intervalos de alta intensidad. No apto para principiantes.' }
];

// Horario laboral de cada entrenador (indice = COACHES).
const HORARIOS_COACH = [
    { coach: 0, dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], inicio: '14:00', fin: '22:00' },
    { coach: 1, dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], inicio: '05:30', fin: '13:30' },
    { coach: 2, dias: ['Lunes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'], inicio: '06:00', fin: '14:00' }
];

const NOTIFICACIONES = [
    { titulo: 'Bienvenido a Slimming Gym', mensaje: 'Tu cuenta fue creada correctamente. Acércate a recepción para tu evaluación inicial.', tipo: 'General' },
    { titulo: 'Pago aprobado', mensaje: 'Tu comprobante fue verificado y tu membresía está activa. ¡Nos vemos en el gimnasio!', tipo: 'Pago' },
    { titulo: 'Nueva rutina asignada', mensaje: 'Tu entrenador cargó una nueva rutina en tu perfil. Revísala antes de tu próxima sesión.', tipo: 'Rutina' },
    { titulo: 'Evaluación física registrada', mensaje: 'Ya puedes revisar tus medidas actualizadas en la sección de progreso.', tipo: 'Evaluación' },
    { titulo: 'Mantenimiento de equipos', mensaje: 'El área de cardio estará cerrada el domingo de 08:00 a 12:00 por mantenimiento.', tipo: 'General' },
    { titulo: 'Cupo confirmado', mensaje: 'Tu reserva para la clase grupal quedó registrada. Llega 10 minutos antes.', tipo: 'Clase' }
];

module.exports = {
    DOMINIO_DEMO,
    PASSWORD_DEMO,
    COACHES,
    ADMINISTRADORES,
    SOCIOS,
    OBJETIVOS,
    NOMBRES_RUTINA,
    EJERCICIOS,
    PLANTILLAS,
    CLASES,
    HORARIOS_COACH,
    NOTIFICACIONES
};
