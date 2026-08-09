const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

const storageOptions = {};

if (process.env.GCS_PROJECT_ID) {
  storageOptions.projectId = process.env.GCS_PROJECT_ID;
}

if (process.env.GCS_KEYFILE_PATH) {
  storageOptions.keyFilename = path.resolve(__dirname, '..', process.env.GCS_KEYFILE_PATH);
}

const storage = new Storage(storageOptions);

// Sin valor por defecto a proposito: un nombre de bucket quemado provocaria
// intentos de escritura silenciosos contra un bucket equivocado o inexistente.
const bucketName = process.env.GCS_BUCKET_NAME;

if (!bucketName) {
  console.warn(
    '[GCS] GCS_BUCKET_NAME no está definida. La subida de comprobantes de pago ' +
    'quedará deshabilitada hasta configurarla en el archivo .env.'
  );
}

const bucket = bucketName ? storage.bucket(bucketName) : null;

/** Indica si el almacenamiento de archivos esta configurado y utilizable. */
const isStorageConfigured = () => Boolean(bucket);

module.exports = { storage, bucket, isStorageConfigured };
