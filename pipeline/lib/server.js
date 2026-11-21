// Démarre un serveur statique (vite preview) sur le dossier dist/ pour Playwright.
import { preview } from 'vite';

export async function startPreview(port = 4179) {
  const server = await preview({ preview: { port, strictPort: false, host: '127.0.0.1' }, logLevel: 'error' });
  const url = server.resolvedUrls.local[0];
  return { url, close: () => new Promise((r) => server.httpServer.close(r)) };
}
