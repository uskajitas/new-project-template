import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import usersApi from './usersApi';

const PORT = parseInt(process.env.PORT || '__PROJECT_PORT_BACKEND__', 10);

const app = express();

// CORS — only the configured client origins may hit /api/*.
const origins = (process.env.CLIENT_ORIGIN_URL || '')
  .split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);            // curl, server-to-server
    if (origins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, project: '__PROJECT_NAME__', ts: new Date().toISOString() });
});

app.use('/api', usersApi);

// Global error handler — never crash the process on a route error.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[err]', err);
  res.status(err.status || 500).json({ error: err.message || 'internal error' });
});

async function main() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`__PROJECT_NAME__ API listening on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.error('Failed to start:', e);
  process.exit(1);
});
