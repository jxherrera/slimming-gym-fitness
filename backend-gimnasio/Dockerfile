# Usar imagen oficial de Node.js
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código del backend
COPY . .

# Puerto por defecto de Cloud Run (8080)
ENV PORT=8080
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["npm", "start"]
