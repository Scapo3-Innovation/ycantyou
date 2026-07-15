import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';
import type { PartnerSharingSettings } from '@/types/database';

import { SHARING_TOGGLES } from '../sharingDefaults';

type SharingToggleListProps = {
  settings: PartnerSharingSettings;
  onChange: (key: keyof PartnerSharingSettings, value: boolean) => void;
  showAdvanced?: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  cycle: 'Cycle',
  wellness: 'Wellness',
  fertility: 'Fertility',
  health: 'Health',
};

export function SharingToggleList({
  settings,
  onChange,
  showAdvanced = false,
}: SharingToggleListProps) {
  const categories = ['cycle', 'wellness', 'fertility', 'health'] as const;

  return (
    <View style={styles.wrap}>
      {categories.map((category) => {
        const toggles = SHARING_TOGGLES.filter(
          (t) => t.category === category && (showAdvanced || !t.advanced),
        );
        if (toggles.length === 0) return null;

        return (
          <View key={category} style={styles.section}>
            <Text style={[typography.captionMedium, styles.sectionLabel, { color: colors.textMuted }]}>
              {CATEGORY_LABELS[category]}
            </Text>
            {toggles.map((toggle) => (
              <Card key={toggle.key} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={[typography.bodyMedium, { color: colors.text }]}>{toggle.label}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {toggle.description}
                  </Text>
                  {toggle.key === 'fertile_window' && settings.fertile_window ? (
                    <Text style={[typography.caption, { color: colors.warning }]}>
                      Not contraception — share only if you both understand the limits.
                    </Text>
                  ) : null}
                </View>
                <Switch
                  value={settings[toggle.key]}
                  onValueChange={(v) => onChange(toggle.key, v)}
                  trackColor={{ false: colors.border, true: colors.roseTint }}
                  thumbColor={settings[toggle.key] ? colors.primary : colors.surface}
                />
              </Card>
            ))}
          </View>
        );
      })}
    </View>
  );
}

type AdvancedSharingAccordionProps = {
  expanded: boolean;
  onToggle: () => void;
  settings: PartnerSharingSettings;
  onChange: (key: keyof PartnerSharingSettings, value: boolean) => void;
};

export function AdvancedSharingAccordion({
  expanded,
  onToggle,
  settings,
  onChange,
}: AdvancedSharingAccordionProps) {
  const advanced = SHARING_TOGGLES.filter((t) => t.advanced);
  if (advanced.length === 0) return null;

  return (
    <View style={styles.section}>
      <Pressable onPress={onToggle} accessibilityRole="button">
        <Text style={[typography.bodyMedium, { color: colors.primary }]}>
          {expanded ? 'Hide advanced sharing' : 'Advanced sharing options'}
        </Text>
      </Pressable>
      {expanded ? (
        <SharingToggleList settings={settings} onChange={onChange} showAdvanced />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});
