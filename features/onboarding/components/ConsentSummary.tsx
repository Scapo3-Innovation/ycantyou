import { StyleSheet, Text, View } from 'react-native';

import type { ConsentBlock } from '@/features/onboarding/consentCopy';
import { colors, spacing, typography } from '@/theme';

type ConsentSummaryProps = {
  blocks: readonly ConsentBlock[];
};

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bullet, { color: colors.primary }]} accessibilityElementsHidden>
        •
      </Text>
      <Text style={[typography.body, styles.bulletText, { color: colors.textMuted }]}>{text}</Text>
    </View>
  );
}

/** Readable consent summary — one section per block, no nested cards. */
export function ConsentSummary({ blocks }: ConsentSummaryProps) {
  return (
    <View style={styles.wrap}>
      {blocks.map((block) => (
        <View key={block.title} style={styles.block}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>{block.title}</Text>
          <View style={styles.list}>
            {block.items.map((item) => (
              <BulletItem key={item} text={item} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xl,
  },
  block: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bullet: {
    ...typography.body,
    lineHeight: 22,
    width: 12,
    textAlign: 'center',
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
});
