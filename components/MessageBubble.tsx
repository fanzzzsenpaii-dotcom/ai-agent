import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { ChatMessage } from '../lib/types';
import { Palette, fonts } from '../lib/theme';
import { formatTime } from '../lib/format';
import Typewriter from './Typewriter';

export default function MessageBubble({
  message,
  colors,
  typewriter,
}: {
  message: ChatMessage;
  colors: Palette;
  typewriter: boolean;
}) {
  const isUser = message.role === 'user';
  const tag = isUser ? 'USER' : message.mode === 'dark' ? '[DARK]' : '[NORMAL]';

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(message.content);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // keep hook order stable
  }, []);

  return (
    <Animated.View
      entering={FadeInDown.duration(280)}
      exiting={FadeOut.duration(180)}
      style={[styles.wrap, isUser ? styles.right : styles.left]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isUser ? colors.user : colors.ai,
            borderColor: message.isError ? colors.danger : colors.line,
          },
          isUser ? styles.userCard : styles.aiCard,
        ]}
      >
        <View style={styles.meta}>
          <Text style={[styles.tag, { color: isUser ? colors.accentSoft : colors.accent }]}>
            {tag}
          </Text>
          <Text style={[styles.time, { color: colors.muted }]}>{formatTime(message.timestamp)}</Text>
        </View>
        {isUser ? (
          <Text style={[styles.userText, { color: colors.text }]}>{message.content}</Text>
        ) : message.isError ? (
          <Text style={[styles.err, { color: colors.danger }]}>{message.content}</Text>
        ) : (
          <Typewriter
            text={message.content}
            colors={colors}
            enabled={!!message.animating && typewriter}
          />
        )}
        {!isUser && !message.isError ? (
          <Pressable onPress={copy} style={styles.copy} hitSlop={8}>
            <Ionicons name="copy-outline" size={14} color={colors.muted} />
            <Text style={[styles.copyTxt, { color: colors.muted }]}>salin</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: 12,
  },
  left: { alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  card: {
    maxWidth: '92%',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userCard: {
    borderTopRightRadius: 4,
  },
  aiCard: {
    borderTopLeftRadius: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  tag: {
    fontFamily: fonts.display,
    fontSize: 10,
    letterSpacing: 1.8,
  },
  time: {
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  userText: {
    fontFamily: fonts.mono,
    fontSize: 14.5,
    lineHeight: 22,
  },
  err: {
    fontFamily: fonts.mono,
    fontSize: 13.5,
    lineHeight: 20,
  },
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  copyTxt: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
  },
});
