import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ChatSession } from './types';

const SESSIONS_KEY = 'bh.ai.sessions.v1';
const SETTINGS_KEY = 'bh.ai.settings.v1';
const TOKEN_KEY = 'bh.ai.session.token.v1';
const ACTIVE_KEY = 'bh.ai.active.session.v1';

export const defaultSettings: AppSettings = {
  uiTheme: 'dark',
  lastMode: 'normal',
  haptics: true,
  typewriter: true,
};

export async function loadSessions(): Promise<ChatSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: ChatSession[]): Promise<void> {
  try {
    const cleaned = sessions.map((s) => ({
      ...s,
      messages: s.messages.map(({ animating, ...m }) => m),
    }));
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(cleaned));
  } catch {
    // ignore quota
  }
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export async function loadToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export async function loadActiveId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export async function saveActiveId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_KEY, id);
  } catch {
    // ignore
  }
}

export async function wipeAll(): Promise<void> {
  await AsyncStorage.multiRemove([SESSIONS_KEY, SETTINGS_KEY, TOKEN_KEY, ACTIVE_KEY]);
}
