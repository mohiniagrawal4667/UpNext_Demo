import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import {
  runTinyFishAgentDiscovery,
  runMockDiscovery,
  getTinyFishServerStatus,
} from './server/tinyfishService.ts';

function tinyfishApiPlugin(): Plugin {
  return {
    name: 'tinyfish-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        // Status endpoint
        if (req.method === 'GET' && req.url === '/api/tinyfish-status') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(getTinyFishServerStatus()));
          return;
        }

        // Discovery endpoint
        if (req.method === 'POST' && req.url === '/api/discover') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const category = parsed.category || 'internship';
              const targetUrl = parsed.targetUrl || parsed.url || 'https://summerofcode.withgoogle.com';
              const mode = parsed.providerMode || parsed.mode || 'live';

              let result;
              if (mode === 'mock') {
                result = runMockDiscovery({
                  url: targetUrl,
                  category,
                  mode: 'mock',
                  customInstructions: parsed.customInstructions,
                });
              } else {
                result = await runTinyFishAgentDiscovery({
                  url: targetUrl,
                  category,
                  mode: 'live',
                  customInstructions: parsed.customInstructions,
                });
              }

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  success: false,
                  error: `Server discovery failure: ${err.message || 'Internal error'}`,
                })
              );
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tinyfishApiPlugin(),
  ],
});
