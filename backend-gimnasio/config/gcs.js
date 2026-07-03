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
const bucketName = process.env.GCS_BUCKET_NAME || 'slimming-gym-bucket';
const bucket = storage.bucket(bucketName);

module.exports = { storage, bucket };
