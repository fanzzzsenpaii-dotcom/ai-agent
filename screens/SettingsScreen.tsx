import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useChat } from '../lib/ChatContext';
import { getPalette, fonts } from '../lib/theme';
import Starfield from '../components/Starfield';

function Row({
  icon,
  label,
  hint,
  colors,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  colors: ReturnType<typeof getPalette>;
  right: React.ReactNode;
}) {
  return (
    <View style={[styles.row, { borderColor: colors.line, backgroundColor: colors.panel }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.card }]}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {hint ? <Text style={[styles.rowHint, { color: colors.muted }]}>{hint}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export default function SettingsScreen() {
  const { mode, uiTheme, setUiTheme, settings, toggleTypewriter, setMode, gatewayOk } = useChat();
  const colors = getPalette(mode, uiTheme);

  const gradient =
    uiTheme === 'light'
      ? (['#eef3f9', '#f7fafc'] as const)
      : mode === 'dark'
      ? (['#050308', '#12061a'] as const)
      : (['#07111f', '#0c1c33'] as const);

  return (
    <LinearGradient colors={[...gradient]} style={styles.fill}>
      <Starfield mode={mode} ui={uiTheme} />
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>KONTROL</Text>
          <Text style={[styles.lead, { color: colors.muted }]}>
            Tema UI terpisah dari persona AI. Kunci API tidak pernah meninggalkan server.
          </Text>

          <Text style={[styles.section, { color: colors.accentSoft }]}>TEMA ANTARMUKA</Text>
          <Row
            icon={uiTheme === 'dark' ? 'moon' : 'sunny'}
            label="Tema gelap UI"
            hint="Berganti tanpa mengubah mode Normal/Dark AI"
            colors={colors}
            right={
              <Switch
                value={uiTheme === 'dark'}
                onValueChange={(v) => setUiTheme(v ? 'dark' : 'light')}
                trackColor={{ false: colors.line, true: colors.accent }}
                thumbColor="#fff"
              />
            }
          />

          <Text style={[styles.section, { color: colors.accentSoft }]}>PERSONA AI</Text>
          <View style={styles.modeRow}>
            <Pressable
              onPress={() => setMode('normal')}
              style={[
                styles.modeCard,
                {
                  borderColor: mode === 'normal' ? colors.accent : colors.line,
                  backgroundColor: colors.panel,
                },
              ]}
            >
              <Ionicons name="planet-outline" size={22} color={mode === 'normal' ? '#3aa0ff' : colors.muted} />
              <Text style={[styles.modeTitle, { color: colors.text }]}>NORMAL</Text>
              <Text style={[styles.modeHint, { color: colors.muted }]}>
                Profesional, hangat, informatif
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('dark')}
              style={[
                styles.modeCard,
                {
                  borderColor: mode === 'dark' ? colors.accent : colors.line,
                  backgroundColor: colors.panel,
                },
              ]}
            >
              <Ionicons name="skull-outline" size={22} color={mode === 'dark' ? '#ff2d55' : colors.muted} />
              <Text style={[styles.modeTitle, { color: colors.text }]}>DARK</Text>
              <Text style={[styles.modeHint, { color: colors.muted }]}>
                Tajam, sinis, tanpa filter
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.section, { color: colors.accentSoft }]}>PERILAKU</Text>
          <Row
            icon="text-outline"
            label="Animasi mengetik"
            hint="Efek mesin tik dengan kecepatan adaptif"
            colors={colors}
            right={
              <Switch
                value={settings.typewriter}
                onValueChange={toggleTypewriter}
                trackColor={{ false: colors.line, true: colors.accent }}
                thumbColor="#fff"
              />
            }
          />

          <Text style={[styles.section, { color: colors.accentSoft }]}>SISTEM</Text>
          <View style={[styles.info, { borderColor: colors.line, backgroundColor: colors.panel }]}>
            <InfoLine k="Model" v="DeepSeek V3.2" colors={colors} />
            <InfoLine k="Gateway" v={gatewayOk ? 'Tersambung' : 'Menunggu tautan'} colors={colors} />
            <InfoLine k="Auth" v="Session token HMAC" colors={colors} />
            <InfoLine k="Enkripsi" v="AES-256-GCM server-side" colors={colors} />
            <InfoLine k="Penyimpanan" v="Lokal di perangkat" colors={colors} />
          </View>

          <View style={[styles.about, { borderColor: colors.line }]}>
            <Text style={[styles.aboutTitle, { color: colors.accentSoft }]}>BLACKHOLE AI</Text>
            <Text style={[styles.aboutBody, { color: colors.muted }]}>
              Chatbot dual-persona. Mode Normal membantu dengan kehangatan profesional.
              Mode Dark menembus basa-basi. Semua permintaan AI melewati proxy backend —
              kunci API tidak pernah tampil di klien.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function InfoLine({
  k,
  v,
  colors,
}: {
  k: string;
  v: string;
  colors: ReturnType<typeof getPalette>;
}) {
  return (
    <View style={styles.infoLine}>
      <Text style={[styles.infoK, { color: colors.muted }]}>{k}</Text>
      <Text style={[styles.infoV, { color: colors.text }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  title: { fontFamily: fonts.display, fontSize: 20, letterSpacing: 3 },
  lead: { fontFamily: fonts.mono, fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 8 },
  section: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 22,
    marginBottom: 10,
  },
  row: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: fonts.displayMed, fontSize: 14 },
  rowHint: { fontFamily: fonts.mono, fontSize: 11, marginTop: 3 },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  modeTitle: { fontFamily: fonts.display, fontSize: 12, letterSpacing: 1.6, marginTop: 4 },
  modeHint: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 16 },
  info: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  infoLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  infoK: { fontFamily: fonts.mono, fontSize: 12 },
  infoV: { fontFamily: fonts.mono, fontSize: 12 },
  about: { marginTop: 24, borderTopWidth: 1, paddingTop: 16 },
  aboutTitle: { fontFamily: fonts.display, letterSpacing: 2, fontSize: 13 },
  aboutBody: { fontFamily: fonts.mono, fontSize: 12.5, lineHeight: 20, marginTop: 8 },
});
