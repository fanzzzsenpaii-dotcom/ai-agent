import { AIMode, ChatMessage } from './types';
import { loadToken, saveToken } from './storage';

function apiBase(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return '';
}

async function requestSession(): Promise<string> {
  const res = await fetch(`${apiBase()}/api/session`, { method: 'POST' });
  if (!res.ok) throw new Error('SESSION_FAIL');
  const data = await res.json();
  if (!data || !data.token) throw new Error('SESSION_FAIL');
  await saveToken(data.token);
  return data.token as string;
}

export async function ensureSession(): Promise<string> {
  const existing = await loadToken();
  if (existing) {
    try {
      const res = await fetch(`${apiBase()}/api/session`, {
        method: 'GET',
        headers: { 'X-Session-Token': existing },
      });
      if (res.ok) return existing;
    } catch {
      // fall through
    }
  }
  return requestSession();
}

export async function sendChat(
  mode: AIMode,
  messages: ChatMessage[]
): Promise<string> {
  const token = await ensureSession();
  const payload = {
    mode,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  };

  const res = await fetch(`${apiBase()}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': token,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && data.error) || 'Sinyal gagal mencapai void.');
  }
  if (!data.content) throw new Error('Respon kosong dari void.');
  return String(data.content);
}
