import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useChat } from '../lib/ChatContext';
import { getPalette, fonts } from '../lib/theme';
import { ChatSession } from '../lib/types';
import { formatDate, previewText } from '../lib/format';
import Starfield from '../components/Starfield';

export default function HistoryScreen() {
  const { sessions, active, selectChat, deleteChat, newChat, mode, uiTheme } = useChat();
  const colors = getPalette(mode, uiTheme);
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');

  const data = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!needle) return list;
    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(needle) ||
        s.messages.some((m) => m.content.toLowerCase().includes(needle))
    );
  }, [sessions, q]);

  const open = (id: string) => {
    selectChat(id);
    nav.navigate('Chat');
  };

  const remove = (item: ChatSession) => {
    const run = () => deleteChat(item.id);
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || window.confirm(`Hapus sesi "${item.title}"?`)) run();
      return;
    }
    Alert.alert('Hapus sesi', `Hapus "${item.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: run },
    ]);
  };

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
        <View style={styles.head}>
          <Text style={[styles.title, { color: colors.text }]}>ARSIP</Text>
          <Pressable
            onPress={() => {
              newChat();
              nav.navigate('Chat');
            }}
            style={[styles.newBtn, { backgroundColor: colors.accent }]}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.newTxt}>Sesi baru</Text>
          </Pressable>
        </View>
        <View style={[styles.search, { borderColor: colors.line, backgroundColor: colors.panel }]}>
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Cari riwayat..."
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="file-tray-outline" size={36} color={colors.muted} />
              <Text style={[styles.emptyTxt, { color: colors.muted }]}>Tidak ada sesi</Text>
            </View>
          }
          renderItem={({ item }) => {
            const last = item.messages[item.messages.length - 1];
            const selected = active?.id === item.id;
            return (
              <Pressable
                onPress={() => open(item.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.panel,
                    borderColor: selected ? colors.accent : colors.line,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.modePill,
                      {
                        backgroundColor:
                          item.mode === 'dark' ? 'rgba(192,38,255,0.16)' : 'rgba(58,160,255,0.16)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeTxt,
                        { color: item.mode === 'dark' ? '#e879ff' : '#7ec4ff' },
                      ]}
                    >
                      {item.mode === 'dark' ? 'DARK' : 'NORMAL'}
                    </Text>
                  </View>
                  <Text style={[styles.when, { color: colors.muted }]}>{formatDate(item.updatedAt)}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.preview, { color: colors.muted }]} numberOfLines={2}>
                  {last ? previewText(last.content, 110) : 'Belum ada pesan'}
                </Text>
                <View style={styles.cardBot}>
                  <Text style={[styles.count, { color: colors.muted }]}>
                    {item.messages.length} pesan
                  </Text>
                  <Pressable onPress={() => remove(item)} hitSlop={10}>
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  head: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontFamily: fonts.display, fontSize: 20, letterSpacing: 3 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  newTxt: { color: '#fff', fontFamily: fonts.displayMed, fontSize: 12, letterSpacing: 0.8 },
  search: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontFamily: fonts.mono, fontSize: 14 },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modePill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  modeTxt: { fontFamily: fonts.display, fontSize: 10, letterSpacing: 1.4 },
  when: { fontFamily: fonts.mono, fontSize: 11 },
  cardTitle: { fontFamily: fonts.displayMed, fontSize: 15, marginTop: 8 },
  preview: { fontFamily: fonts.mono, fontSize: 12.5, lineHeight: 18, marginTop: 6 },
  cardBot: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: { fontFamily: fonts.mono, fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTxt: { fontFamily: fonts.mono, fontSize: 13 },
});
