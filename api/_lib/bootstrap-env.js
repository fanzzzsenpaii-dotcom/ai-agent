// Server-only bootstrap. Never imported by the Expo client bundle.
// Secrets are provided via Vercel environment variables (API_KEY,
// ENCRYPTION_SECRET, SESSION_SECRET, ALLOWED_ORIGINS). Do not hardcode them here.
if (!process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS = '*';
}

module.exports = {};
