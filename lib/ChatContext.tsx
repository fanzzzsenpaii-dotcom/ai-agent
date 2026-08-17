import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AIMode,
  AppSettings,
  ChatMessage,
  ChatSession,
  UITheme,
} from './types';
import {
  defaultSettings,
  loadActiveId,
  loadSessions,
  loadSettings,
  saveActiveId,
  saveSessions,
  saveSettings,
} from './storage';
import { sendChat, ensureSession } from './api';
import { titleFromMessage, uid } from './format';
import { tapFeedback } from './haptics';

interface ChatContextValue {
  ready: boolean;
  sessions: ChatSession[];
  active: ChatSession | null;
  settings: AppSettings;
  mode: AIMode;
  uiTheme: UITheme;
  sending: boolean;
  error: string | null;
  setMode: (mode: AIMode) => void;
  setUiTheme: (theme: UITheme) => void;
  toggleTypewriter: () => void;
  newChat: () => void;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  clearActive: () => void;
  send: (text: string) => Promise<void>;
  lastAssistant: ChatMessage | null;
  gatewayOk: boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function emptySession(mode: AIMode): ChatSession {
  const now = Date.now();
  return {
    id: uid('ses'),
    title: 'Sesi baru',
    mode,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gatewayOk, setGatewayOk] = useState(false);
  const sendingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [s, st, aid] = await Promise.all([
        loadSessions(),
        loadSettings(),
        loadActiveId(),
      ]);
      if (!mounted) return;
      setSettings(st);
      if (s.length === 0) {
        const first = emptySession(st.lastMode);
        setSessions([first]);
        setActiveId(first.id);
      } else {
        setSessions(s);
        setActiveId(aid && s.some((x) => x.id === aid) ? aid : s[0].id);
      }
      setReady(true);
      try {
        await ensureSession();
        if (mounted) setGatewayOk(true);
      } catch {
        if (mounted) setGatewayOk(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveSessions(sessions);
  }, [sessions, ready]);

  useEffect(() => {
    if (!ready) return;
    saveSettings(settings);
  }, [settings, ready]);

  useEffect(() => {
    if (!ready || !activeId) return;
    saveActiveId(activeId);
  }, [activeId, ready]);

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) || null,
    [sessions, activeId]
  );

  const lastAssistant = useMemo(() => {
    if (!active) return null;
    for (let i = active.messages.length - 1; i >= 0; i--) {
      if (active.messages[i].role === 'assistant' && !active.messages[i].isError) {
        return active.messages[i];
      }
    }
    return null;
  }, [active]);

  const patchActive = useCallback(
    (fn: (s: ChatSession) => ChatSession) => {
      setSessions((prev) => prev.map((s) => (s.id === activeId ? fn(s) : s)));
    },
    [activeId]
  );

  const setMode = useCallback(
    (mode: AIMode) => {
      setSettings((p) => ({ ...p, lastMode: mode }));
      patchActive((s) => ({ ...s, mode, updatedAt: Date.now() }));
      tapFeedback(settings.haptics, 'medium');
    },
    [patchActive, settings.haptics]
  );

  const setUiTheme = useCallback((uiTheme: UITheme) => {
    setSettings((p) => ({ ...p, uiTheme }));
  }, []);

  const toggleTypewriter = useCallback(() => {
    setSettings((p) => ({ ...p, typewriter: !p.typewriter }));
  }, []);

  const newChat = useCallback(() => {
    const ses = emptySession(settings.lastMode);
    setSessions((prev) => [ses, ...prev]);
    setActiveId(ses.id);
    setError(null);
    tapFeedback(settings.haptics, 'light');
  }, [settings.lastMode, settings.haptics]);

  const selectChat = useCallback(
    (id: string) => {
      setActiveId(id);
      setError(null);
      tapFeedback(settings.haptics, 'light');
    },
    [settings.haptics]
  );

  const deleteChat = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (next.length === 0) {
          const fresh = emptySession(settings.lastMode);
          setActiveId(fresh.id);
          return [fresh];
        }
        if (activeId === id) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId, settings.lastMode]
  );

  const clearActive = useCallback(() => {
    patchActive((s) => ({
      ...s,
      messages: [],
      title: 'Sesi baru',
      updatedAt: Date.now(),
    }));
    setError(null);
    tapFeedback(settings.haptics, 'warning');
  }, [patchActive, settings.haptics]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sendingRef.current || !active) return;
      sendingRef.current = true;
      setSending(true);
      setError(null);
      tapFeedback(settings.haptics, 'light');

      const userMsg: ChatMessage = {
        id: uid('usr'),
        role: 'user',
        content: trimmed,
        mode: active.mode,
        timestamp: Date.now(),
      };

      const nextMessages = [...active.messages, userMsg];
      patchActive((s) => ({
        ...s,
        messages: nextMessages,
        title: s.messages.length === 0 ? titleFromMessage(trimmed) : s.title,
        updatedAt: Date.now(),
      }));

      try {
        const reply = await sendChat(active.mode, nextMessages);
        const aiMsg: ChatMessage = {
          id: uid('ai'),
          role: 'assistant',
          content: reply,
          mode: active.mode,
          timestamp: Date.now(),
          animating: settings.typewriter,
        };
        patchActive((s) => ({
          ...s,
          messages: [...s.messages, aiMsg],
          updatedAt: Date.now(),
        }));
        setGatewayOk(true);
      } catch (e: any) {
        const msg = e && e.message ? String(e.message) : 'Koneksi ke void terputus.';
        setError(msg);
        const errMsg: ChatMessage = {
          id: uid('err'),
          role: 'assistant',
          content: msg,
          mode: active.mode,
          timestamp: Date.now(),
          isError: true,
        };
        patchActive((s) => ({
          ...s,
          messages: [...s.messages, errMsg],
          updatedAt: Date.now(),
        }));
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [active, patchActive, settings.haptics, settings.typewriter]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      ready,
      sessions,
      active,
      settings,
      mode: active?.mode || settings.lastMode,
      uiTheme: settings.uiTheme,
      sending,
      error,
      setMode,
      setUiTheme,
      toggleTypewriter,
      newChat,
      selectChat,
      deleteChat,
      clearActive,
      send,
      lastAssistant,
      gatewayOk,
    }),
    [
      ready,
      sessions,
      active,
      settings,
      sending,
      error,
      setMode,
      setUiTheme,
      toggleTypewriter,
      newChat,
      selectChat,
      deleteChat,
      clearActive,
      send,
      lastAssistant,
      gatewayOk,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
