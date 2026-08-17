import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Palette, fonts } from '../lib/theme';
import { AIMode } from '../lib/types';
import { isVoiceSupported, startVoice } from '../lib/voice';

export default function CommandBar({
  colors,
  mode,
  sending,
  onSend,
}: {
  colors: Palette;
  mode: AIMode;
  sending: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState('');
  const stopRef = useRef<null | (() => void)>(null);
  const voiceOk = isVoiceSupported() && mode === 'normal';

  const submit = () => {
    const t = text.trim();
    if (!t || sending) return;
    onSend(t);
    setText('');
    setVoiceHint('');
  };

  const toggleVoice = () => {
    if (!voiceOk) return;
    if (listening) {
      stopRef.current?.();
      setListening(false);
      return;
    }
    setListening(true);
    stopRef.current = startVoice({
      onPartial: (p) => setVoiceHint(p),
      onFinal: (f) => {
        setText((prev) => (prev ? `${prev} ${f}` : f).trim());
        setVoiceHint('');
      },
      onError: (m) => {
        setVoiceHint(m);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });
  };

  return (
    <View style={[styles.wrap, { borderColor: colors.line, backgroundColor: colors.panel }]}>
      <Text style={[styles.prompt, { color: colors.accent }]}>&gt;</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="> ketik pesan ke Blackhole..."
        placeholderTextColor={colors.muted}
        style={[styles.input, { color: colors.text }]}
        multiline
        maxLength={4000}
        editable={!sending}
        returnKeyType="send"
        blurOnSubmit={Platform.OS !== 'web'}
        onSubmitEditing={submit}
      />
      {voiceOk ? (
        <Pressable
          onPress={toggleVoice}
          style={[styles.iconBtn, listening && { backgroundColor: colors.accent }]}
        >
          <Ionicons
            name={listening ? 'mic' : 'mic-outline'}
            size={18}
            color={listening ? '#fff' : colors.accentSoft}
          />
        </Pressable>
      ) : null}
      <Pressable
        onPress={submit}
        disabled={sending || !text.trim()}
        style={[
          styles.send,
          { backgroundColor: colors.accent, opacity: sending || !text.trim() ? 0.45 : 1 },
        ]}
      >
        {sending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons name="arrow-up" size={18} color="#fff" />
        )}
      </Pressable>
      {voiceHint ? (
        <Text style={[styles.hint, { color: colors.muted }]} numberOfLines={1}>
          {listening ? 'mendengar: ' : ''}{voiceHint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
  prompt: {
    fontFamily: fonts.mono,
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    minWidth: 140,
    maxHeight: 140,
    fontFamily: fonts.mono,
    fontSize: 14.5,
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    width: '100%',
    fontFamily: fonts.mono,
    fontSize: 11,
    paddingLeft: 18,
  },
});
