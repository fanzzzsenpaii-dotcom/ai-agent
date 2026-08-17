import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Palette, fonts } from '../lib/theme';
import { AIMode } from '../lib/types';

const SUGGEST_NORMAL = [
  'Jelaskan cara kerja black hole secara sederhana',
  'Buatkan ringkasan berita sains hari ini',
  'Bantu aku merancang rencana belajar 30 hari',
];

const SUGGEST_DARK = [
  'Katakan yang sebenarnya soal kebiasaan produktif palsu',
  'Bedah kelemahan argumen populer ini',
  'Jangan basa-basi: apa yang salah dengan idenya?',
];

export default function EmptyState({
  colors,
  mode,
  onPick,
}: {
  colors: Palette;
  mode: AIMode;
  onPick: (t: string) => void;
}) {
  const items = mode === 'dark' ? SUGGEST_DARK : SUGGEST_NORMAL;
  return (
    <View style={styles.wrap}>
      <View style={[styles.badge, { borderColor: colors.line, backgroundColor: colors.card }]}>
        <Ionicons
          name={mode === 'dark' ? 'skull-outline' : 'planet-outline'}
          size={28}
          color={colors.accent}
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>BLACKHOLE AI</Text>
      <Text style={[styles.sub, { color: colors.muted }]}>
        {mode === 'dark'
          ? 'Mode Dark aktif. Kebenaran mentah, tanpa filter.'
          : 'Mode Normal aktif. Asisten profesional, hangat, dan jelas.'}
      </Text>
      <View style={styles.list}>
        {items.map((s) => (
          <Pressable
            key={s}
            onPress={() => onPick(s)}
            style={[styles.chip, { borderColor: colors.line, backgroundColor: colors.panel }]}>
            <Text style={[styles.chipTxt, { color: colors.text }]}>{s}</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.accent} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 40,
    gap: 10,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 3,
  },
  sub: {
    fontFamily: fonts.mono,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 360,
  },
  list: {
    width: '100%',
    maxWidth: 480,
    marginTop: 16,
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  chipTxt: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 18,
  },
});
