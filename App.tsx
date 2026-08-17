import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Orbitron_500Medium,
  Orbitron_700Bold,
} from '@expo-google-fonts/orbitron';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import { ChatProvider, useChat } from './lib/ChatContext';
import { getPalette } from './lib/theme';
import ChatScreen from './screens/ChatScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function Tabs() {
  const { mode, uiTheme, ready } = useChat();
  const colors = getPalette(mode, uiTheme);

  if (!ready) {
    return (
      <View style={[styles.boot, { backgroundColor: colors.void }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.panel,
          borderTopColor: colors.line,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: 1.2,
          fontFamily: 'Orbitron_500Medium',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Chat: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Arsip: focused ? 'time' : 'time-outline',
            Kontrol: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={map[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Arsip" component={HistoryScreen} />
      <Tab.Screen name="Kontrol" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    Orbitron_500Medium,
    Orbitron_700Bold,
    ShareTechMono_400Regular,
  });

  if (!fontsLoaded) return null;

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <ChatProvider>
          <NavigationContainer theme={navTheme}>
            <Tabs />
          </NavigationContainer>
        </ChatProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
