const { createSessionToken, verifySessionToken } = require('./_lib/session');
const { applyCors, sendJson } = require('./_lib/http');
const { sealApiKey } = require('./_lib/crypto');

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    sealApiKey();
  } catch {
    return sendJson(res, 503, { error: 'Void gateway offline. Konfigurasi server belum siap.' });
  }

  if (req.method === 'GET') {
    const token = req.headers['x-session-token'];
    const session = verifySessionToken(Array.isArray(token) ? token[0] : token);
    if (!session) {
      return sendJson(res, 401, { ok: false, error: 'Sesi tidak valid.' });
    }
    return sendJson(res, 200, { ok: true, exp: session.exp });
  }

  if (req.method === 'POST') {
    const token = createSessionToken();
    return sendJson(res, 200, { ok: true, token });
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
};
