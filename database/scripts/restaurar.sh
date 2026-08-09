#!/bin/bash
# ==============================================================================
# SCRIPT DE RESTAURACIÓN DE RESPALDO
# ==============================================================================
# Uso: ./restaurar.sh /backups/nombre_del_respaldo.bak.enc
# Restaura la base de datos Slimming Gym Fitness desencriptando el archivo y
# realizando el RESTORE con los MOVE de archivos lógicos correspondientes.
# ==============================================================================

if [ -z "$1" ]; then
    echo "❌ Error: Debes proveer la ruta del archivo a restaurar."
    echo "Uso: ./restaurar.sh /backups/archivo.bak.enc"
    exit 1
fi

INPUT_FILE="$1"
DB_NAME="GymDatabase"
BAK_FILE="/var/opt/mssql/data/temp_restore.bak"

echo "Iniciando proceso de restauración..."

if [[ "$INPUT_FILE" == *.enc ]]; then
    if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
        echo "❌ Error: El archivo está cifrado pero BACKUP_ENCRYPTION_KEY no está configurada."
        exit 1
    fi
    echo "🔓 Desencriptando archivo..."
    openssl enc -aes-256-cbc -d -in "$INPUT_FILE" -out "$BAK_FILE" -pass pass:"$BACKUP_ENCRYPTION_KEY"
    if [ $? -ne 0 ]; then
        echo "❌ Error al desencriptar el archivo."
        exit 1
    fi
else
    echo "Copiando archivo de respaldo sin encriptar..."
    cp "$INPUT_FILE" "$BAK_FILE"
fi

echo "🔄 Restaurando la base de datos en SQL Server..."
# Comando SQL para restaurar. Reemplazar los nombres lógicos si son distintos.
SQL_CMD="RESTORE DATABASE [$DB_NAME] FROM DISK = N'$BAK_FILE' WITH FILE = 1, MOVE N'GymDatabase' TO N'/var/opt/mssql/data/GymDatabase.mdf', MOVE N'GymDatabase_log' TO N'/var/opt/mssql/data/GymDatabase_log.ldf', NOUNLOAD, REPLACE, STATS = 5"

/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "$SQL_CMD"

if [ $? -eq 0 ]; then
    echo "✅ Restauración completada con éxito."
else
    echo "❌ Falló la restauración en SQL Server."
fi

# Limpieza del archivo temporal
rm -f "$BAK_FILE"
echo "🧹 Archivo temporal eliminado."
