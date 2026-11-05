import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, 'src/web/ui'),
      '@modules': path.resolve(__dirname, 'src/web/modules'),
      '@common': path.resolve(__dirname, 'src/web/common'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: { usePolling: true },
    hmr: { host: process.env.VITE_HMR_HOST || 'localhost' },
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:3010',
        changeOrigin: true,
      },
    },
  },
})
