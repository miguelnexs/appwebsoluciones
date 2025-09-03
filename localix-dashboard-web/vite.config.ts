import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://softwarebycg.shop',
        changeOrigin: true,
        secure: false,
        timeout: 60000, // 60 segundos para uploads grandes
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Configurar headers para uploads grandes
            if (req.method === 'POST' || req.method === 'PUT') {
              proxyReq.setHeader('Connection', 'keep-alive');
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            // Log específico para errores 413
            if (proxyRes.statusCode === 413) {
              console.error('❌ Error 413: Request Entity Too Large - Archivo demasiado grande');
            }
          });
        },
      }
    }
  }
})
