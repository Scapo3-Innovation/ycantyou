import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import type { LegalDocument } from '@/features/privacy/legalCopy';
import { colors, screenScrollContent, spacing, typography } from '@/theme';

type LegalDocumentViewProps = {
  document: LegalDocument;
  onBack: () => void;
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

/** Scrollable in-app legal page — privacy policy or terms. */
export function LegalDocumentView({ document, onBack }: LegalDocumentViewProps) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={document.title} onBack={onBack} />

        <Text style={[typography.caption, { color: colors.textFaint }]}>
          Last updated: {document.lastUpdated}
        </Text>

        {document.intro ? (
          <Text style={[typography.body, styles.intro, { color: colors.textMuted }]}>
            {document.intro}
          </Text>
        ) : null}

        <View style={styles.sections}>
          {document.sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{section.title}</Text>
              {section.paragraphs?.map((paragraph) => (
                <Text
                  key={paragraph}
                  style={[typography.body, styles.paragraph, { color: colors.textMuted }]}>
                  {paragraph}
                </Text>
              ))}
              {section.items ? (
                <View style={styles.list}>
                  {section.items.map((item) => (
                    <BulletItem key={item} text={item} />
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    ...screenScrollContent,
    gap: spacing.lg,
  },
  intro: {
    lineHeight: 22,
  },
  sections: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  paragraph: {
    lineHeight: 22,
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
