const { getDecryptedApiKey, sealApiKey } = require('./_lib/crypto');
const { verifySessionToken } = require('./_lib/session');
const { getSystemPrompt } = require('./_lib/prompts');
const { applyCors, readJsonBody, sendJson } = require('./_lib/http');

const WINDOW_MS = 60_000;
const MAX_REQ = 30;
const hits = new Map();

function rateLimit(id) {
  const now = Date.now();
  const row = hits.get(id) || [];
  const fresh = row.filter((t) => now - t < WINDOW_MS);
  if (fresh.length >= MAX_REQ) return false;
  fresh.push(now);
  hits.set(id, fresh);
  return true;
}

function sanitizeMessages(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(-20)
    .map((m) => ({
      role: m.role,
      content: String(m.content || '').slice(0, 8000),
    }))
    .filter((m) => m.content.trim().length > 0);
}

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    sealApiKey();
  } catch {
    return sendJson(res, 503, { error: 'Void gateway offline. Konfigurasi server belum siap.' });
  }

  const token = req.headers['x-session-token'];
  const session = verifySessionToken(Array.isArray(token) ? token[0] : token);
  if (!session) {
    return sendJson(res, 401, { error: 'Sesi tidak sah. Muat ulang aplikasi.' });
  }

  if (!rateLimit(session.id)) {
    return sendJson(res, 429, { error: 'Terlalu banyak sinyal. Tunggu sebentar.' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (e) {
    const msg = e && e.message === 'PAYLOAD_TOO_LARGE' ? 'Pesan terlalu besar.' : 'Payload tidak valid.';
    return sendJson(res, 400, { error: msg });
  }

  const mode = body.mode === 'dark' ? 'dark' : 'normal';
  const messages = sanitizeMessages(body.messages);
  if (messages.length === 0) {
    return sendJson(res, 400, { error: 'Pesan kosong.' });
  }

  let apiKey;
  try {
    apiKey = getDecryptedApiKey();
  } catch {
    return sendJson(res, 503, { error: 'Gagal membuka saluran enkripsi.' });
  }

  const payload = {
    model: 'deepseek/deepseek-v3.2',
    messages: [{ role: 'system', content: getSystemPrompt(mode) }, ...messages],
    temperature: 0.7,
    max_tokens: 2048,
  };

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://blackhole-ai.app',
        'X-Title': 'Blackhole AI',
      },
      body: JSON.stringify(payload),
    });

    const raw = await upstream.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return sendJson(res, 502, { error: 'Respon void tidak terbaca.' });
    }

    if (!upstream.ok) {
      return sendJson(res, 502, { error: 'Blackhole gagal menjangkau model. Coba lagi.' });
    }

    const content = data && data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || '')
      : '';

    if (!content) {
      return sendJson(res, 502, { error: 'Model mengirim sinyal kosong.' });
    }

    return sendJson(res, 200, { content, mode });
  } catch {
    return sendJson(res, 502, { error: 'Koneksi ke void terputus.' });
  }
};
