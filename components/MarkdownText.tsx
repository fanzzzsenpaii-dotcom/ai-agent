import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TextStyle } from 'react-native';
import { Palette, fonts } from '../lib/theme';

interface Props {
  content: string;
  colors: Palette;
}

type Token =
  | { t: 'text'; v: string; bold?: boolean; italic?: boolean; code?: boolean }
  | { t: 'br' }
  | { t: 'codeblock'; v: string; lang?: string }
  | { t: 'li'; v: string; n?: number }
  | { t: 'h'; v: string; l: number };

function parseInline(src: string): Token[] {
  const out: Token[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ t: 'text', v: src.slice(last, m.index) });
    const raw = m[0];
    if (raw.startsWith('`')) out.push({ t: 'text', v: raw.slice(1, -1), code: true });
    else if (raw.startsWith('**')) out.push({ t: 'text', v: raw.slice(2, -2), bold: true });
    else if (raw.startsWith('*')) out.push({ t: 'text', v: raw.slice(1, -1), italic: true });
    else out.push({ t: 'text', v: raw.slice(1, -1), italic: true });
    last = m.index + raw.length;
  }
  if (last < src.length) out.push({ t: 'text', v: src.slice(last) });
  return out;
}

function parseMarkdown(src: string): Token[] {
  const tokens: Token[] = [];
  const parts = src.split(/```/);
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      const nl = part.indexOf('\n');
      if (nl === -1) {
        tokens.push({ t: 'codeblock', v: part });
      } else {
        tokens.push({ t: 'codeblock', v: part.slice(nl + 1).replace(/\n$/, ''), lang: part.slice(0, nl).trim() });
      }
      return;
    }
    const lines = part.split('\n');
    lines.forEach((line, li) => {
      const h = /^(#{1,3})\s+(.*)$/.exec(line);
      const ul = /^[-*]\s+(.*)$/.exec(line);
      const ol = /^(\d+)\.\s+(.*)$/.exec(line);
      if (h) tokens.push({ t: 'h', v: h[2], l: h[1].length });
      else if (ul) tokens.push({ t: 'li', v: ul[1] });
      else if (ol) tokens.push({ t: 'li', v: ol[2], n: Number(ol[1]) });
      else {
        tokens.push(...parseInline(line));
        if (li < lines.length - 1) tokens.push({ t: 'br' });
      }
    });
  });
  return tokens;
}

export default function MarkdownText({ content, colors }: Props) {
  const tokens = useMemo(() => parseMarkdown(content), [content]);

  const base: TextStyle = {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 14.5,
    lineHeight: 22,
  };

  const nodes: React.ReactNode[] = [];
  let inline: React.ReactNode[] = [];
  let key = 0;

  const flush = () => {
    if (inline.length === 0) return;
    nodes.push(
      <Text key={`p-${key++}`} style={base}>
        {inline}
      </Text>
    );
    inline = [];
  };

  tokens.forEach((tok) => {
    if (tok.t === 'text') {
      inline.push(
        <Text
          key={`t-${key++}`}
          style={[
            tok.bold ? { fontWeight: '700' } : null,
            tok.italic ? { fontStyle: 'italic' } : null,
            tok.code
              ? {
                  backgroundColor: colors.card,
                  color: colors.accentSoft,
                  paddingHorizontal: 5,
                  borderRadius: 4,
                  fontSize: 13,
                }
              : null,
          ]}
        >
          {tok.v}
        </Text>
      );
    } else if (tok.t === 'br') {
      inline.push('\n');
    } else if (tok.t === 'h') {
      flush();
      nodes.push(
        <Text
          key={`h-${key++}`}
          style={[base, styles.h, { color: colors.accentSoft, fontSize: 18 - tok.l }]}>
          {tok.v}
        </Text>
      );
    } else if (tok.t === 'li') {
      flush();
      nodes.push(
        <View key={`li-${key++}`} style={styles.li}>
          <Text style={[base, { color: colors.accent }]}>
            {tok.n ? `${tok.n}.` : '▸'}
          </Text>
          <Text style={[base, { flex: 1 }]}>{tok.v}</Text>
        </View>
      );
    } else if (tok.t === 'codeblock') {
      flush();
      nodes.push(
        <View
          key={`cb-${key++}`}
          style={[styles.code, { backgroundColor: colors.void, borderColor: colors.line }]}>
          {tok.lang ? (
            <Text style={[styles.lang, { color: colors.muted }]}>{tok.lang}</Text>
          ) : null}
          <Text style={[base, { color: colors.accentSoft, fontSize: 13 }]} selectable>
            {tok.v}
          </Text>
        </View>
      );
    }
  });
  flush();

  return <View>{nodes}</View>;
}

const styles = StyleSheet.create({
  h: {
    fontFamily: fonts.displayMed,
    marginTop: 8,
    marginBottom: 4,
  },
  li: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 4,
    marginVertical: 2,
  },
  code: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  lang: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
});
