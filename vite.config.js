process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleAuthRequest } from './server/authHandler.js'

function karigarAuthPlugin() {
  const isApiPath = (url) => url && url.startsWith('/api/');

  return {
    name: 'karigar-auth-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (isApiPath(req.url)) {
          await handleAuthRequest(req, res);
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (isApiPath(req.url)) {
          await handleAuthRequest(req, res);
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    karigarAuthPlugin()
  ],
})
