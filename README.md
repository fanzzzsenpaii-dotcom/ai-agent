# BLACKHOLE AI

Chatbot dual-persona dengan UI terminal futuristik.

- **Mode Normal** — profesional, hangat, informatif (DeepSeek V3.2)
- **Mode Dark** — tajam, sinis, tanpa filter (DeepSeek V3.2)

Kunci API tidak pernah dikirim ke frontend. Semua permintaan OpenRouter melewati proxy backend. Kunci dienkripsi AES-256-GCM di server sebelum dipakai.

## Fitur

- Input bergaya command line
- Log percakapan dengan tag `[NORMAL]` / `[DARK]`
- Toggle persona dengan animasi
- Indikator neon mode aktif
- Clear, copy output, export `.txt`
- Animasi mengetik kecepatan adaptif
- Riwayat tersimpan di perangkat
- Markdown (bold, italic, code, list)
- Voice input (Web Speech API, mode Normal)
- Tema UI gelap/terang terpisah dari persona AI

## Struktur

```
api/chat.js          proxy OpenRouter + session check
api/session.js       penerbit token sesi HMAC
api/_lib/crypto.js   AES-256-GCM
scripts/local-gateway.js  gateway Express lokal
App.tsx              aplikasi React Native / Expo
```

## Setup lokal

```bash
cp .env.example .env
# isi API_KEY OpenRouter
npm install
node scripts/local-gateway.js
npx expo start
```

Variabel lingkungan:

```
API_KEY=sk-or-v1-...
ENCRYPTION_SECRET=string-acak-panjang
SESSION_SECRET=string-acak-panjang-lain
ALLOWED_ORIGINS=*
PORT=3001
```

Jangan commit file `.env`.

## Keamanan

1. Frontend hanya mengirim `X-Session-Token`.
2. Backend memverifikasi token HMAC.
3. `API_KEY` diambil dari env, dienkripsi AES-256-GCM, didekripsi hanya saat request ke OpenRouter.
4. Error gateway tidak pernah memuat potongan kunci.
