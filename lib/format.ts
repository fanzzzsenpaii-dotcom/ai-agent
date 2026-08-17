export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatStamp(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function previewText(text: string, max = 72): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1) + '…';
}

export function titleFromMessage(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return 'Sesi baru';
  return clean.length > 36 ? clean.slice(0, 35) + '…' : clean;
}

export function buildExport(title: string, mode: string, messages: { role: string; content: string; mode?: string; timestamp: number }[]): string {
  const lines = [
    '══════════════════════════════════════',
    '   BLACKHOLE AI  —  CHAT EXPORT',
    '══════════════════════════════════════',
    `Judul     : ${title}`,
    `Mode      : ${mode.toUpperCase()}`,
    `Diekspor  : ${formatStamp(Date.now())}`,
    `Pesan     : ${messages.length}`,
    '──────────────────────────────────────',
    '',
  ];
  for (const m of messages) {
    const tag = m.role === 'user' ? 'USER' : `[${(m.mode || mode).toUpperCase()}] BLACKHOLE`;
    lines.push(`[${formatStamp(m.timestamp)}] ${tag}`);
    lines.push(m.content);
    lines.push('');
  }
  lines.push('──────────────────────────────────────');
  lines.push('End of transmission.');
  return lines.join('\n');
}
