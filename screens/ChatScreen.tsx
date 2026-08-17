import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useChat } from '../lib/ChatContext';
import { getPalette, fonts } from '../lib/theme';
import { ChatMessage } from '../lib/types';
import { buildExport } from '../lib/format';
import Starfield from '../components/Starfield';
import NeonPulse from '../components/NeonPulse';
import ModeToggle from '../components/ModeToggle';
import CommandBar from '../components/CommandBar';
import MessageBubble from '../components/MessageBubble';
import EmptyState from '../components/EmptyState';

function downloadTxt(filename: string, content: string) {
  if (typeof document !== 'undefined') {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  }
  return false;
}

export default function ChatScreen() {
  const {
    active,
    mode,
    uiTheme,
    sending,
    send,
    setMode,
    clearActive,
    lastAssistant,
    settings,
    gatewayOk,
  } = useChat();
  const colors = getPalette(mode, uiTheme);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [toast, setToast] = useState('');
  const { width } = useWindowDimensions();
  const compact = width < 380;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  };

  const onCopyLast = async () => {
    if (!lastAssistant) {
      showToast('Belum ada output AI');
      return;
    }
    try {
      await Clipboard.setStringAsync(lastAssistant.content);
      showToast('Output terakhir disalin');
    } catch {
      showToast('Gagal menyalin');
    }
  };

  const onExport = async () => {
    if (!active || active.messages.length === 0) {
      showToast('Tidak ada riwayat');
      return;
    }
    const body = buildExport(active.title, active.mode, active.messages);
    const name = `blackhole-${active.mode}-${Date.now()}.txt`;
    const ok = downloadTxt(name, body);
    if (ok) {
      showToast('Chat diekspor');
      return;
    }
    try {
      await Clipboard.setStringAsync(body);
      showToast('Export disalin ke clipboard');
    } catch {
      showToast('Gagal mengekspor');
    }
  };

  const onClear = () => {
    if (!active || active.messages.length === 0) return;
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' ? window.confirm('Hapus seluruh riwayat sesi ini?') : true;
      if (ok) {
        clearActive();
        showToast('Chat dibersihkan');
      }
      return;
    }
    Alert.alert('Clear Chat', 'Hapus seluruh riwayat sesi ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          clearActive();
          showToast('Chat dibersihkan');
        },
      },
    ]);
  };

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble message={item} colors={colors} typewriter={settings.typewriter} />
    ),
    [colors, settings.typewriter]
  );

  const gradient = useMemo(() => {
    if (uiTheme === 'light') {
      return mode === 'dark'
        ? ['#f6eefe', '#efe6f4', '#f8f4fb']
        : ['#d9e8f8', '#eef3f8', '#f7fafc'];
    }
    return mode === 'dark'
      ? ['#050308', '#12061a', '#1a0818']
      : ['#07111f', '#0c1c33', '#12202e'];
  }, [mode, uiTheme]);

  return (
    <LinearGradient colors={gradient as [string, string, ...string[]]} style={styles.fill}>
      <StatusBar style={uiTheme === 'light' ? 'dark' : 'light'} />
      <Starfield mode={mode} ui={uiTheme} />
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.header, { borderBottomColor: colors.line }]}>
            <View style={styles.brand}>
              <Text style={[styles.logo, { color: colors.accentSoft }]}>
                {compact ? 'BH' : 'BLACKHOLE'}
              </Text>
              <Text style={[styles.logoSub, { color: colors.muted }]}>AI</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.live}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: gatewayOk ? colors.ok : colors.danger },
                  ]}
                />
                <Text style={[styles.liveTxt, { color: colors.muted }]}>
                  {gatewayOk ? 'LINK' : 'VOID'}
                </Text>
              </View>
              <NeonPulse mode={mode} colors={colors} />
            </View>
          </View>

          <View style={styles.toolbar}>
            <ModeToggle mode={mode} onChange={setMode} colors={colors} />
            <View style={styles.actions}>
              <Pressable onPress={onCopyLast} style={[styles.tool, { borderColor: colors.line }]}>
                <Ionicons name="copy-outline" size={16} color={colors.accentSoft} />
                {!compact ? (
                  <Text style={[styles.toolTxt, { color: colors.muted }]}>Copy</Text>
                ) : null}
              </Pressable>
              <Pressable onPress={onExport} style={[styles.tool, { borderColor: colors.line }]}>
                <Ionicons name="download-outline" size={16} color={colors.accentSoft} />
                {!compact ? (
                  <Text style={[styles.toolTxt, { color: colors.muted }]}>Export</Text>
                ) : null}
              </Pressable>
              <Pressable onPress={onClear} style={[styles.tool, { borderColor: colors.line }]}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
                {!compact ? (
                  <Text style={[styles.toolTxt, { color: colors.muted }]}>Clear</Text>
                ) : null}
              </Pressable>
            </View>
          </View>

          <FlatList
            ref={listRef}
            data={active?.messages || []}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            style={styles.fill}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <EmptyState colors={colors} mode={mode} onPick={send} />
            }
            ListFooterComponent={
              sending ? (
                <View style={styles.typing}>
                  <Text style={[styles.typingTxt, { color: colors.accent }]}>
                    {mode === 'dark' ? '[DARK] merakit jawaban...' : '[NORMAL] mengetik...'}
                  </Text>
                </View>
              ) : null
            }
          />

          <View style={styles.inputPad}>
            <CommandBar colors={colors} mode={mode} sending={sending} onSend={send} />
          </View>

          {toast ? (
            <Animated.View
              entering={FadeIn.duration(160)}
              exiting={FadeOut.duration(160)}
              style={[styles.toast, { backgroundColor: colors.card, borderColor: colors.line }]}>
              <Text style={[styles.toastTxt, { color: colors.text }]}>{toast}</Text>
            </Animated.View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  brand: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  logo: {
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: 2.4,
  },
  logoSub: {
    fontFamily: fonts.displayMed,
    fontSize: 12,
    letterSpacing: 2,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  liveTxt: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4 },
  toolbar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  actions: { flexDirection: 'row', gap: 8 },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  toolTxt: { fontFamily: fonts.mono, fontSize: 11 },
  list: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 20, flexGrow: 1 },
  typing: { paddingVertical: 8, paddingLeft: 4 },
  typingTxt: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 0.4 },
  inputPad: { paddingHorizontal: 12, paddingBottom: 10, paddingTop: 4 },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 92,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toastTxt: { fontFamily: fonts.mono, fontSize: 12 },
});
