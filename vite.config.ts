import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

// Host Portal with Apple Black design: served directly on /host-portal/
// Redirect /standalone-host-portal/ to /host-portal/ to ensure a single unified portal.
function standalonePortalStaticFiles(): Plugin {
  const portalDir = path.resolve(__dirname, 'standalone-host-portal');
  const portalFile = (requestUrl: string | undefined) => {
    const pathname = (requestUrl || '').split('?')[0];
    if (pathname === '/host-portal' || pathname === '/host-portal/' || pathname === '/host-portal/index.html') return 'index.html';
    if (pathname === '/host-portal/app.js') return 'app.js';
    if (pathname === '/standalone-host-portal' || pathname === '/standalone-host-portal/' || pathname === '/standalone-host-portal/index.html') return 'index.html';
    if (pathname === '/standalone-host-portal/app.js') return 'app.js';
    return null;
  };
  return {
    name: 'aurora-standalone-portal-static-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url || '').split('?')[0];
        if (pathname === '/standalone-host-portal' || pathname === '/standalone-host-portal/') {
          res.statusCode = 302;
          res.setHeader('Location', '/host-portal/');
          return res.end();
        }
        const fileName = portalFile(req.url);
        if (!fileName) return next();
        res.statusCode = 200;
        res.setHeader('Content-Type', fileName.endsWith('.js') ? 'application/javascript; charset=utf-8' : 'text/html; charset=utf-8');
        res.end(fs.readFileSync(path.join(portalDir, fileName)));
      });
    },
    generateBundle() {
      for (const fileName of ['index.html', 'app.js']) {
        const content = fs.readFileSync(path.join(portalDir, fileName));
        this.emitFile({
          type: 'asset',
          fileName: `host-portal/${fileName}`,
          source: content,
        });
        this.emitFile({
          type: 'asset',
          fileName: `standalone-host-portal/${fileName}`,
          source: content,
        });
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      standalonePortalStaticFiles(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'Aurora in Valtellina',
          short_name: 'Aurora PWA',
          description: 'Guida digitale e concierge per gli ospiti di Aurora in Valtellina a Morbegno.',
          theme_color: '#0f766e',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'unsplash-images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});
