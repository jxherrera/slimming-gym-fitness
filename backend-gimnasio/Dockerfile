# API REST de Slimming Gym Fitness
# Imagen usada por los servicios 'api' y 'worker' del docker-compose.yml

# Node 22 LTS y no Node 20: la linea 20 alcanzo su fin de vida en abril de 2026 y
# ya no recibe parches de seguridad. Alpine mantiene la imagen pequena.
FROM node:22-alpine

# curl es el cliente del HEALTHCHECK.
RUN apk add --no-cache curl

# El usuario sin privilegios se crea ANTES de copiar archivos y se cambia a el
# antes de instalar dependencias. Asi todo nace con el propietario correcto y se
# evita un `chown -R /app` posterior, que reescribiria node_modules completo en
# una capa nueva y sumaria unos 100 MB inutiles a la imagen final.
RUN addgroup -S slimming && adduser -S slimming -G slimming

WORKDIR /app
RUN mkdir -p /app/uploads && chown -R slimming:slimming /app

# Si la API llegara a ser comprometida, el atacante queda sin privilegios
# administrativos dentro del contenedor.
USER slimming

# Las dependencias se copian ANTES del codigo fuente: mientras package.json no
# cambie, Docker reutiliza esta capa y reconstruir tras editar codigo tarda
# segundos en lugar de reinstalar node_modules cada vez.
COPY --chown=slimming:slimming package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=slimming:slimming . .

ENV NODE_ENV=production \
    PORT=5001 \
    UPLOADS_DIR=/app/uploads

EXPOSE 5001

# Se sondea /api/health/live y no /api/health: esta comprobacion decide si el
# contenedor se considera sano, y no debe depender de la base de datos. Si
# dependiera, una caida momentanea de la base marcaria como no sanas a todas las
# replicas simultaneamente y el proxy dejaria de enviarles trafico, convirtiendo
# un problema de datos en una caida total del servicio.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:5001/api/health/live || exit 1

CMD ["node", "server.js"]
