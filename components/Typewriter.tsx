import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import MarkdownText from './MarkdownText';
import { Palette } from '../lib/theme';

export default function Typewriter({
  text,
  colors,
  enabled,
  onDone,
}: {
  text: string;
  colors: Palette;
  enabled: boolean;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState(enabled ? '' : text);
  const done = useRef(false);

  const delay = useMemo(() => {
    const len = text.length;
    if (len > 1400) return 6;
    if (len > 800) return 8;
    if (len > 400) return 12;
    if (len > 180) return 16;
    return 22;
  }, [text.length]);

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      if (!done.current) {
        done.current = true;
        onDone?.();
      }
      return;
    }
    setShown('');
    done.current = false;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        if (!done.current) {
          done.current = true;
          onDone?.();
        }
        return;
      }
      const ch = text[i - 1];
      const extra = ch === '.' || ch === '!' || ch === '?' ? 40 : ch === ',' ? 16 : 0;
      timer = setTimeout(tick, delay + extra);
    };
    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [text, enabled, delay, onDone]);

  return (
    <View>
      <MarkdownText content={shown} colors={colors} />
    </View>
  );
}
