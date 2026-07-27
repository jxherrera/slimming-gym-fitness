import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Minificar al máximo con esbuild (opción predeterminada y súper rápida)
    minify: 'esbuild',
    // 2. Definir el target para navegadores modernos, reduciendo polyfills innecesarios
    target: 'esnext',
    // 3. Incrementar el límite de assets inline a 4KB para evitar requests HTTP para íconos/imágenes pequeñas
    assetsInlineLimit: 4096,
    // 4. Configurar Rollup para dividir chunks (Code Splitting manual)
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('react-router-dom') || id.includes('react-router') || id.includes('@remix-run')) {
              return 'vendor-router';
            }
            if (id.includes('jspdf')) {
              return 'vendor-jspdf';
            }
            if (id.includes('moment')) {
              return 'vendor-moment';
            }
            if (id.includes('react-big-calendar')) {
              return 'vendor-calendar';
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
          }
        }
      }
    },
    // 5. Deshabilitar sourcemaps para producción
    sourcemap: false,
    // 6. Elevar el límite de advertencia de tamaño de chunks a 1000kb
    chunkSizeWarningLimit: 1000
  },
  // 7. Remover consoles y debuggers del build final de producción para optimizar peso y privacidad
  esbuild: {
    drop: ['console', 'debugger'],
    pure: ['console.log', 'console.info', 'console.debug', 'console.trace']
  }
})
