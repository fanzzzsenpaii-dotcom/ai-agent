import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AIMode, UITheme } from '../lib/types';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  dur: number;
  drift: number;
  color: string;
}

function StarDot({ star }: { star: Star }) {
  const o = useSharedValue(0.15);
  const ty = useSharedValue(0);

  useEffect(() => {
    o.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(1, { duration: star.dur, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      )
    );
    ty.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(star.drift, { duration: star.dur * 3, easing: Easing.linear }),
        -1,
        true
      )
    );
  }, [o, ty, star.delay, star.dur, star.drift]);

  const style = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: star.color,
        },
        style,
      ]}
    />
  );
}

export default function Starfield({ mode, ui }: { mode: AIMode; ui: UITheme }) {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(() => {
    const count = Math.min(70, Math.max(28, Math.floor((width * height) / 18000)));
    const list: Star[] = [];
    for (let i = 0; i < count; i++) {
      const dark = mode === 'dark';
      list.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: dark ? 1 + Math.random() * 2.4 : 1 + Math.random() * 1.6,
        delay: Math.random() * 1800,
        dur: 1400 + Math.random() * 2600,
        drift: (Math.random() - 0.5) * 18,
        color: dark
          ? Math.random() > 0.78
            ? '#ff4d6d'
            : Math.random() > 0.4
            ? '#c026ff'
            : '#ffffff'
          : ui === 'light'
          ? Math.random() > 0.5
            ? '#90caf9'
            : '#bbdefb'
          : Math.random() > 0.55
          ? '#7ec4ff'
          : '#d7e9ff',
      });
    }
    return list;
  }, [width, height, mode, ui]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((s) => (
        <StarDot key={s.id} star={s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
  },
});
