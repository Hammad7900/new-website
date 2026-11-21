import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { getCJAccessToken } from './netlify/functions/cj-auth.js';
import { fetchLiveCJProducts } from './netlify/functions/cj-products.js';

// Vite dev server plugin to handle /api/cj-* serverless endpoints locally
function cjApiPlugin() {
  return {
    name: 'cj-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost:3000');

        if (url.pathname === '/api/cj-auth') {
          try {
            const auth = await getCJAccessToken();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: !!auth.token, accessToken: auth.token, source: auth.source }));
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: e.message }));
          }
        }

        if (url.pathname === '/api/cj-products') {
          try {
            const pageNum = parseInt(url.searchParams.get('pageNum') || '1', 10);
            const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
            const category = url.searchParams.get('category') || '';
            const search = url.searchParams.get('search') || '';
            const productId = url.searchParams.get('id') || '';

            const result = await fetchLiveCJProducts({ pageNum, pageSize, search, category, productId });
            res.setHeader('Content-Type', 'application/json');
            if (productId && !Array.isArray(result.products)) {
              return res.end(JSON.stringify({ success: true, data: [result], source: 'cj_live_detail' }));
            }
            return res.end(JSON.stringify({ success: true, data: result.products, total: result.total, source: result.source }));
          } catch (e) {
            console.error('API Error in dev server:', e);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: e.message }));
          }
        }

        if (url.pathname === '/api/cj-order' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { handler } = await import('./netlify/functions/cj-order.js');
              const out = await handler({ httpMethod: 'POST', body: JSON.stringify(payload) });
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

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), cjApiPlugin()],
  server: {
    host: true,
    port: 3000,
  }
});
