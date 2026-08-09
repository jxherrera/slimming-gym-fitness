const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

/**
 * Almacenamiento de archivos subidos (comprobantes de pago) en el disco de la
 * propia maquina virtual.
 *
 * El controlador de pagos no conoce donde se guardan los archivos: consume esta
 * interfaz. Si en el futuro el almacenamiento cambiara (otro disco, un servicio
 * externo), solo se sustituye este modulo.
 *
 * Nginx sirve el directorio publicamente bajo la ruta /uploads (ver
 * docs/despliegue-vm.md).
 */

// Directorio raiz de subidas. Fuera del arbol de codigo por defecto para que un
// `git pull` o un redespliegue no lo toque.
const UPLOADS_DIR = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(__dirname, '..', 'uploads');

const SUBCARPETA_COMPROBANTES = 'receipts';

// Prefijo de la URL publica. Relativo a proposito: asi el sistema funciona en
// cualquier dominio o IP sin reconfigurar nada, igual que VITE_API_URL=/api.
const RUTA_PUBLICA = '/uploads';

/**
 * Tipos permitidos y su extension. La extension SIEMPRE se deriva del tipo MIME,
 * nunca del nombre que envia el cliente.
 *
 * La lista blanca es indispensable: los archivos se sirven desde nuestro propio
 * dominio, asi que permitir HTML o SVG habilitaria la ejecucion de scripts en el
 * origen de la aplicacion (XSS almacenado). Solo imagenes rasterizadas y PDF.
 */
const TIPOS_PERMITIDOS = {
    'image/jpeg': '.jpg',
    'image/pjpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/heic': '.heic',
    'application/pdf': '.pdf'
};

const asegurarDirectorio = async (directorio) => {
    await fsp.mkdir(directorio, { recursive: true });
};

/** Verifica que el directorio de subidas exista y sea escribible. */
const isStorageConfigured = () => {
    try {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        fs.accessSync(UPLOADS_DIR, fs.constants.W_OK);
        return true;
    } catch (error) {
        console.error(`[Storage] El directorio de subidas no es escribible (${UPLOADS_DIR}): ${error.message}`);
        return false;
    }
};

/** Lista legible de formatos aceptados, para los mensajes de error. */
const formatosAceptados = () =>
    [...new Set(Object.values(TIPOS_PERMITIDOS))].join(', ');

/**
 * Guarda el comprobante recibido por multer (en memoria) en el disco.
 *
 * @param {{buffer: Buffer, mimetype: string, size: number}} file
 * @returns {Promise<{url: string, absolutePath: string}>} url relativa para la
 *          base de datos y ruta absoluta (util para adjuntar el archivo a un correo)
 * @throws {Error} con `statusCode = 415` si el tipo de archivo no esta permitido
 */
const guardarComprobante = async (file) => {
    const extension = TIPOS_PERMITIDOS[file.mimetype];

    if (!extension) {
        const error = new Error(
            `Tipo de archivo no permitido (${file.mimetype}). Formatos aceptados: ${formatosAceptados()}.`
        );
        error.statusCode = 415;
        throw error;
    }

    // Nombre aleatorio: impide que la URL de un comprobante ajeno se pueda
    // adivinar a partir de la fecha o del nombre original del archivo.
    const nombre = `${crypto.randomBytes(16).toString('hex')}${extension}`;

    const directorio = path.join(UPLOADS_DIR, SUBCARPETA_COMPROBANTES);
    await asegurarDirectorio(directorio);

    const absolutePath = path.join(directorio, nombre);
    await fsp.writeFile(absolutePath, file.buffer, { mode: 0o640 });

    return {
        url: `${RUTA_PUBLICA}/${SUBCARPETA_COMPROBANTES}/${nombre}`,
        absolutePath
    };
};

/**
 * Traduce una URL almacenada a su ruta absoluta en disco.
 * Devuelve null si la URL no corresponde al almacenamiento local (por ejemplo,
 * los comprobantes historicos que apuntan a Google Cloud Storage).
 */
const rutaAbsolutaDesdeUrl = (url) => {
    if (typeof url !== 'string' || !url.startsWith(`${RUTA_PUBLICA}/`)) {
        return null;
    }

    const relativa = url.slice(RUTA_PUBLICA.length + 1);
    const absoluta = path.resolve(UPLOADS_DIR, relativa);

    // Defensa contra travesia de directorios (../) en el valor almacenado.
    if (!absoluta.startsWith(UPLOADS_DIR + path.sep)) {
        return null;
    }

    return fs.existsSync(absoluta) ? absoluta : null;
};

/**
 * Elimina un archivo del disco. Se usa para no dejar comprobantes huerfanos
 * cuando el registro en base de datos falla despues de haberlo guardado.
 * No lanza si el archivo ya no existe.
 */
const eliminarArchivo = async (absolutePath) => {
    if (!absolutePath) return;
    try {
        await fsp.unlink(absolutePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`[Storage] No se pudo eliminar ${absolutePath}: ${error.message}`);
        }
    }
};

module.exports = {
    guardarComprobante,
    eliminarArchivo,
    rutaAbsolutaDesdeUrl,
    isStorageConfigured,
    formatosAceptados,
    UPLOADS_DIR,
    RUTA_PUBLICA,
    TIPOS_PERMITIDOS
};
