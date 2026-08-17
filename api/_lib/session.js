const crypto = require('crypto');
require('./bootstrap-env');

function getSecret() {
  return process.env.SESSION_SECRET || 'blackhole-session-dev-only';
}

function sign(payloadB64) {
  return crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
}

function createSessionToken() {
  const payload = {
    id: crypto.randomUUID(),
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    aud: 'blackhole-ai',
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.aud !== 'blackhole-ai') return null;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = { createSessionToken, verifySessionToken };
