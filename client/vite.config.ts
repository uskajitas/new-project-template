import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// __PROJECT_NAME__ — frontend dev server.
// Proxies /api/* to the backend so the client never hardcodes a base URL.
export default defineConfig({
  plugins: [react()],
  server: {
    port: __PROJECT_PORT_FRONTEND__,
    strictPort: true,
    host: 'localhost',
    proxy: {
      '/api': 'http://localhost:__PROJECT_PORT_BACKEND__',
    },
  },
});
