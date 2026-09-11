import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleAuthRequest } from './authHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

const PORT = process.env.PORT || 5000;

const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer(async (req, res) => {
  // Set CORS headers for standalone development and cross-origin Render deployments
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Idempotency-Key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle static uploads (e.g. /uploads/avatars/...)
  if (req.url && req.url.startsWith('/uploads/')) {
    const cleanUrl = req.url.split('?')[0];
    const filePath = path.join(PUBLIC_DIR, cleanUrl);

    // Prevent path traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      res.statusCode = 200;
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.statusCode = 404;
      res.end('File not found');
      return;
    }
  }

  // Route all API requests directly to handleAuthRequest BEFORE any static file or SPA fallback
  if (req.url && req.url.startsWith('/api/')) {
    await handleAuthRequest(req, res);
    return;
  }

  // Serve static production bundle (dist/) if available (Render Web Service deployment)
  if (fs.existsSync(DIST_DIR)) {
    const cleanUrl = req.url.split('?')[0];
    const requestedFile = path.join(DIST_DIR, cleanUrl);

    // If exact static file exists (e.g. /assets/index-xxx.js)
    if (requestedFile.startsWith(DIST_DIR) && fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
      const ext = path.extname(requestedFile).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      res.statusCode = 200;
      fs.createReadStream(requestedFile).pipe(res);
      return;
    }

    // SPA Fallback: for any frontend route (e.g. /login, /patron, /seller/dashboard), serve index.html
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      fs.createReadStream(indexPath).pipe(res);
      return;
    }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Karigar Auth API Server running on port ${PORT}`);
});
