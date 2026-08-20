import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';

const app = express();

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    app.use((await createViteServer({ server: { middlewareMode: true }, appType: 'spa' })).middlewares);
  } else {
    const dist = path.join(process.cwd(), 'dist');
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => console.log(`AfterCredits server listening on port ${port}`));
}

start().catch(error => { console.error(error); process.exit(1); });
