const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('./bootstrap-env');

function loadDotEnv() {
  try {
    const dotenv = require('dotenv');
    const candidates = [
      path.join(process.cwd(), '.env.server'),
      path.join(__dirname, '..', '..', '.env.server'),
      path.join(__dirname, '..', '.env.server'),
      path.join(process.cwd(), '.env'),
      path.join(__dirname, '..', '..', '.env'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        dotenv.config({ path: p });
      }
    }
  } catch {
    // dotenv optional if platform injects env
  }
}

loadDotEnv();

function deriveKey() {
  const secret = process.env.ENCRYPTION_SECRET || 'blackhole-fallback-dev-only';
  return crypto.scryptSync(secret, 'blackhole-aes-salt-v1', 32);
}

function encrypt(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted.toString('hex'),
  };
}

function decrypt(bundle) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    deriveKey(),
    Buffer.from(bundle.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(bundle.tag, 'hex'));
  return decipher.update(Buffer.from(bundle.data, 'hex'), undefined, 'utf8') + decipher.final('utf8');
}

let encryptedApiKey = null;

function sealApiKey() {
  if (encryptedApiKey) return;
  const raw = process.env.API_KEY;
  if (!raw) {
    throw new Error('SERVER_MISCONFIG');
  }
  encryptedApiKey = encrypt(raw);
}

function getDecryptedApiKey() {
  sealApiKey();
  return decrypt(encryptedApiKey);
}

module.exports = {
  encrypt,
  decrypt,
  sealApiKey,
  getDecryptedApiKey,
};
