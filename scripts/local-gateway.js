require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.server') });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatHandler = require('../api/chat');
const sessionHandler = require('../api/session');
const { sealApiKey } = require('../api/_lib/crypto');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: true,
    allowedHeaders: ['Content-Type', 'X-Session-Token', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, name: 'Blackhole AI Gateway' });
});

app.all('/api/session', (req, res) => sessionHandler(req, res));
app.all('/api/chat', (req, res) => chatHandler(req, res));

try {
  sealApiKey();
  console.log('Blackhole gateway sealed. AES-256-GCM online.');
} catch {
  console.error('Gateway misconfigured. Set API_KEY in .env.server');
}

app.listen(PORT, () => {
  console.log(`Blackhole proxy listening on :${PORT}`);
});
