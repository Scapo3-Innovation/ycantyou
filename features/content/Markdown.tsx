import { Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

/**
 * Minimal markdown renderer for article bodies. Supports the subset our content uses:
 * `#`/`##` headings, `-`/`*` bullet lists, blank-line paragraphs, and inline **bold** /
 * *italic*. Pure JS, themed with our tokens — Expo Go-safe, no dependency.
 */

type Block =
  | { type: 'h1' | 'h2' | 'p'; text: string }
  | { type: 'ul'; items: string[] };

function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let bullets: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ') });
      para = [];
    }
  };
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ type: 'ul', items: [...bullets] });
      bullets = [];
    }
  };

  for (const raw of body.split('\n')) {
    const t = raw.trim();
    if (t === '') {
      flushPara();
      flushBullets();
    } else if (t.startsWith('## ')) {
      flushPara();
      flushBullets();
      blocks.push({ type: 'h2', text: t.slice(3) });
    } else if (t.startsWith('# ')) {
      flushPara();
      flushBullets();
      blocks.push({ type: 'h1', text: t.slice(2) });
    } else if (t.startsWith('- ') || t.startsWith('* ')) {
      flushPara();
      bullets.push(t.slice(2));
    } else {
      flushBullets();
      para.push(t);
    }
  }
  flushPara();
  flushBullets();
  return blocks;
}

const INLINE = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

/** Render inline **bold** / *italic* within a line. */
function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) out.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>);
    if (m[2] !== undefined) {
      out.push(
        <Text key={key++} style={styles.bold}>
          {m[2]}
        </Text>,
      );
    } else if (m[3] !== undefined) {
      out.push(
        <Text key={key++} style={styles.italic}>
          {m[3]}
        </Text>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return out;
}

export function Markdown({ body }: { body: string }) {
  const blocks = parseBlocks(body);
  return (
    <View style={styles.container}>
      {blocks.map((block, i) => {
        if (block.type === 'h1') {
          return (
            <Text key={i} style={[typography.h1, styles.heading, { color: colors.text }]}>
              {renderInline(block.text)}
            </Text>
          );
        }
        if (block.type === 'h2') {
          return (
            <Text key={i} style={[typography.h2, styles.heading, { color: colors.text }]}>
              {renderInline(block.text)}
            </Text>
          );
        }
        if (block.type === 'ul') {
          return (
            <View key={i} style={styles.list}>
              {block.items.map((item, j) => (
                <View key={j} style={styles.bulletRow}>
                  <Text style={[typography.body, { color: colors.primary }]}>•</Text>
                  <Text style={[typography.body, styles.bulletText, { color: colors.text }]}>
                    {renderInline(item)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={[typography.body, { color: colors.text }]}>
            {renderInline(block.text)}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  heading: {
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
});
