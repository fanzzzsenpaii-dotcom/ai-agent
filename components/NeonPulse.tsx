import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Palette, fonts } from '../lib/theme';
import { AIMode } from '../lib/types';

export default function NeonPulse({
  mode,
  colors,
}: {
  mode: AIMode;
  colors: Palette;
}) {
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [pulse]);

  const glow = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.9 + pulse.value * 0.18 }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.orb,
          { backgroundColor: colors.accent, shadowColor: colors.accent },
          glow,
        ]}
      />
      <Text style={[styles.label, { color: colors.accentSoft }]}>
        {mode === 'dark' ? 'DARK' : 'NORMAL'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 2.4,
  },
});
