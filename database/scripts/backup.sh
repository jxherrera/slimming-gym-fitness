#!/bin/bash
# ==============================================================================
# SCRIPT DE RESPALDO CIFRADO
# ==============================================================================
# Uso: ./backup.sh
# Genera un respaldo de la base de datos Slimming Gym Fitness y lo cifra con AES-256
# ==============================================================================

BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H%M%S)
DB_NAME="GymDatabase"
BAK_FILE="$BACKUP_DIR/respaldo_cloudsql_$DATE.bak"
ENC_FILE="$BAK_FILE.enc"

# 1. Ejecutar Backup de SQL Server (Asume ejecución desde el contenedor o con permisos)
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "BACKUP DATABASE [$DB_NAME] TO DISK = N'$BAK_FILE' WITH NOFORMAT, NOINIT, NAME = 'Respaldo Completo', SKIP, NOREWIND, NOUNLOAD, STATS = 10"

if [ $? -eq 0 ]; then
    echo "✅ Backup generado exitosamente: $BAK_FILE"
    
    # 2. Cifrar archivo
    # Requiere que la variable de entorno BACKUP_ENCRYPTION_KEY esté configurada
    if [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
        openssl enc -aes-256-cbc -salt -in "$BAK_FILE" -out "$ENC_FILE" -pass pass:"$BACKUP_ENCRYPTION_KEY"
        
        if [ $? -eq 0 ]; then
            echo "🔐 Archivo cifrado correctamente: $ENC_FILE"
            # Eliminar archivo original sin cifrar
            rm "$BAK_FILE"
        else
            echo "❌ Error al cifrar el respaldo"
        fi
    else
        echo "⚠️ ADVERTENCIA: BACKUP_ENCRYPTION_KEY no está configurada. El archivo se guardó sin cifrar."
    fi

    # 3. Limpieza: Eliminar respaldos más antiguos que 7 días
    find $BACKUP_DIR -name "*.enc" -type f -mtime +7 -exec rm {} \;
    find $BACKUP_DIR -name "*.bak" -type f -mtime +7 -exec rm {} \;
    echo "🧹 Rotación completada (archivos mayores a 7 días eliminados)."
else
    echo "❌ Error al generar el respaldo de la base de datos."
fi
