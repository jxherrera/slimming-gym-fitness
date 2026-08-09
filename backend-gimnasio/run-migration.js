const fs = require('fs');
const path = require('path');
const { sql, poolPromise } = require('./config/db');

async function runMigration() {
    try {
        console.log('===========================================================');
        console.log('EJECUTANDO MIGRACIÓN SPRINT 8 EN BASE DE DATOS');
        console.log('===========================================================');

        const pool = await poolPromise;
        console.log('✅ Conexión establecida con la base de datos.');

        // Ruta del archivo de migración
        const migrationPath = path.join(__dirname, '../database/migration_sprint8.sql');
        
        if (!fs.existsSync(migrationPath)) {
            throw new Error(`No se encontró el archivo de migración en: ${migrationPath}`);
        }

        const sqlContent = fs.readFileSync(migrationPath, 'utf8');

        // Separar las sentencias por el comando GO (insensible a mayúsculas/minúsculas)
        const queries = sqlContent
            .split(/\bGO\b/i)
            .map(q => {
                // Eliminar cualquier comando USE [nombre_db] del bloque de código
                return q.replace(/\bUSE\s+\[?\w+\]?;?/gi, '').trim();
            })
            .filter(q => {
                // Eliminar comentarios de una línea (-- ...) para verificar si queda código real
                const withoutComments = q.replace(/--.*$/gm, '').trim();
                return withoutComments.length > 0;
            });

        console.log(`\n🔎 Se detectaron ${queries.length} bloques de consultas para ejecutar.`);

        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            console.log(`\n[Bloque ${i + 1}/${queries.length}] Ejecutando:`);
            console.log('-----------------------------------------------------------');
            console.log(query.substring(0, 150) + (query.length > 150 ? '...' : ''));
            console.log('-----------------------------------------------------------');

            await pool.request().query(query);
            console.log(`✅ Bloque ${i + 1} ejecutado con éxito.`);
        }

        console.log('\n===========================================================');
        console.log('🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!');
        console.log('El procedimiento sp_GetPublicPlans ha sido creado/actualizado.');
        console.log('===========================================================');
    } catch (err) {
        console.error('\n❌ ERROR AL EJECUTAR LA MIGRACIÓN:', err.message || err);
    } finally {
        // Cerrar las conexiones activas para terminar el proceso de Node.js
        sql.close();
        console.log('Conexión cerrada.');
        process.exit(0);
    }
}

runMigration();
