import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AIMode } from '../lib/types';
import { Palette, fonts } from '../lib/theme';

export default function ModeToggle({
  mode,
  onChange,
  colors,
}: {
  mode: AIMode;
  onChange: (m: AIMode) => void;
  colors: Palette;
}) {
  const t = useSharedValue(mode === 'dark' ? 1 : 0);

  useEffect(() => {
    t.value = withSpring(mode === 'dark' ? 1 : 0, { damping: 16, stiffness: 180 });
  }, [mode, t]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], ['#1a3d66', '#2a0a38']),
    borderColor: interpolateColor(t.value, [0, 1], ['#3aa0ff', '#c026ff']),
  }));

  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: 4 + t.value * 34 }],
    backgroundColor: interpolateColor(t.value, [0, 1], ['#3aa0ff', '#ff2d55']),
  }));

  return (
    <View style={styles.row}>
      <Ionicons
        name="planet-outline"
        size={16}
        color={mode === 'normal' ? colors.accentSoft : colors.muted}
      />
      <Pressable
        onPress={() => onChange(mode === 'normal' ? 'dark' : 'normal')}
        accessibilityRole="switch"
        accessibilityState={{ checked: mode === 'dark' }}
        accessibilityLabel="Toggle mode Blackhole"
      >
        <Animated.View style={[styles.track, track]}>
          <Animated.View style={[styles.knob, knob]}>
            <Ionicons
              name={mode === 'dark' ? 'skull-outline' : 'sparkles-outline'}
              size={13}
              color="#fff"
            />
          </Animated.View>
        </Animated.View>
      </Pressable>
      <Ionicons
        name="skull-outline"
        size={16}
        color={mode === 'dark' ? colors.danger : colors.muted}
      />
      <Text style={[styles.cap, { color: colors.muted }]}>
        {mode === 'dark' ? 'DARK' : 'NORMAL'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    width: 70,
    height: 30,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  cap: {
    fontFamily: fonts.display,
    fontSize: 10,
    letterSpacing: 1.6,
  },
});
