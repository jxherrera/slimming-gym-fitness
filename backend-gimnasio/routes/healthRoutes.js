const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { buildHealthResponse } = require('../utils/healthStatus');

// Tiempo maximo que se espera a la base antes de considerarla inalcanzable.
// Corto a proposito: config/db.js reintenta la conexion hasta 25 segundos, y
// esperar ese tiempo haria que el healthcheck de Docker expirara por lentitud
// en lugar de informar el estado real.
const TIMEOUT_BD_MS = 2000;

const INSTANCIA = process.env.HOSTNAME || 'local';

/**
 * Comprueba que la base responda de verdad, no solo que el pool exista.
 * Nunca lanza: devuelve false ante cualquier fallo o demora.
 */
const comprobarBaseDeDatos = async () => {
    let temporizador;

    const expiracion = new Promise((_, reject) => {
        temporizador = setTimeout(() => reject(new Error('timeout')), TIMEOUT_BD_MS);
        temporizador.unref(); // no debe mantener vivo el proceso
    });

    try {
        const pool = await Promise.race([poolPromise, expiracion]);
        await Promise.race([pool.request().query('SELECT 1 AS ok'), expiracion]);
        return true;
    } catch (error) {
        return false;
    } finally {
        clearTimeout(temporizador);
    }
};

/**
 * GET /api/health
 * Estado completo: 200 si la API y la base responden, 503 si la base no.
 * Publico a proposito: lo consultan Docker y Nginx, que no disponen de token.
 */
router.get('/', async (req, res) => {
    const dbOk = await comprobarBaseDeDatos();
    const { httpStatus, body } = buildHealthResponse({
        dbOk,
        uptimeSeconds: process.uptime(),
        instance: INSTANCIA
    });

    res.status(httpStatus).json(body);
});

/**
 * GET /api/health/live
 * Solo comprueba que el proceso responde, sin consultar la base.
 *
 * Es la sonda que usa el HEALTHCHECK del contenedor. Si se usara /api/health
 * para eso, una caida momentanea de la base marcaria como no sanas a TODAS las
 * replicas a la vez y el proxy dejaria de enviarles trafico, convirtiendo un
 * problema de datos en una caida total del servicio.
 */
router.get('/live', (req, res) => {
    res.json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        instance: INSTANCIA
    });
});

module.exports = router;
