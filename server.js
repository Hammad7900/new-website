// server.js - Zero-dependency Node.js production server for Hostinger VPS / Node.js Hosting
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCJAccessToken } from './netlify/functions/cj-auth.js';
import { fetchLiveCJProducts } from './netlify/functions/cj-products.js';
import { handler as orderHandler } from './netlify/functions/cj-order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, CJ-Access-Token');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // API Route: /api/cj-auth
  if (pathname === '/api/cj-auth') {
    try {
      const auth = await getCJAccessToken();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: !!auth.token, accessToken: auth.token, source: auth.source }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  // API Route: /api/cj-products
  if (pathname === '/api/cj-products') {
    try {
      const pageNum = parseInt(parsedUrl.searchParams.get('pageNum') || '1', 10);
      const pageSize = parseInt(parsedUrl.searchParams.get('pageSize') || '20', 10);
      const category = parsedUrl.searchParams.get('category') || '';
      const search = parsedUrl.searchParams.get('search') || '';
      const productId = parsedUrl.searchParams.get('id') || '';

      const result = await fetchLiveCJProducts({ pageNum, pageSize, search, category, productId });
      res.setHeader('Content-Type', 'application/json');
      if (productId && !Array.isArray(result.products)) {
        return res.end(JSON.stringify({ success: true, data: [result], source: 'cj_live_detail' }));
      }
      return res.end(JSON.stringify({ success: true, data: result.products, total: result.total, source: result.source }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  // API Route: /api/cj-order
  if (pathname === '/api/cj-order' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const out = await orderHandler({ httpMethod: 'POST', body: JSON.stringify(payload) });
        res.statusCode = out.statusCode || 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(out.body);
      } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Static File Serving from dist/
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: serve index.html for unknown routes
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.statusCode = 404;
        return res.end('Not Found');
      }
      res.setHeader('Content-Type', contentType);
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`AURA Store server running on port ${PORT}`);
});
