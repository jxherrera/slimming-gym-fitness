# Slimming Gym Fitness 🏋️‍♂️

Guía rápida para que el equipo pueda instalar y correr el proyecto localmente sin problemas.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu equipo:
- **Node.js** (v16 o superior) y **npm** (viene incluido con Node.js).
- **Git** (para manejar el repositorio).

> [!IMPORTANT]
> **Base de Datos:** El proyecto necesita conectarse a la base de datos. **¡Avísale a Josue para que tenga la DB prendida!** 
> (Si vas a correr la base de datos de manera local, asegúrate de configurar tus propias credenciales en el archivo `.env` del backend).

---

## ⚙️ 1. Configuración del Backend

El backend es la API que conecta nuestra página con la base de datos.

1. Abre una terminal y entra a la carpeta del backend:
   ```bash
   cd backend-gimnasio
   ```

2. Instala todas las dependencias necesarias:
   ```bash
   npm install
   ```

3. Asegúrate de tener el archivo `.env` con las variables de entorno (pídeselo a Josue si no lo tienes).

4. Levanta el servidor:
   ```bash
   node server.js
   ```
   *(Deja esta terminal abierta para que el servidor siga corriendo).*

---

## 💻 2. Configuración del Frontend

El frontend es la interfaz gráfica de nuestra aplicación, construida con React y Vite.

1. Abre una **nueva ventana de terminal** y entra a la carpeta del frontend:
   ```bash
   cd frontend-gimnasio
   ```

2. Instala las dependencias del frontend:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. **¡Listo!** En la terminal te aparecerá una dirección local (por ejemplo, `http://localhost:5173/`). Presiona **Ctrl + Clic** sobre el enlace para abrir la aplicación en tu navegador.