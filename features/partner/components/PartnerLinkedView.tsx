import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';

type PartnerLinkedViewProps = {
  partnerName: string;
  status: 'active' | 'paused';
  connectedAt: string;
  onManageSharing: () => void;
  onPause: () => void;
  onResume: () => void;
  onRevoke: () => void;
};

function formatConnectedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PartnerLinkedView({
  partnerName,
  status,
  connectedAt,
  onManageSharing,
  onPause,
  onResume,
  onRevoke,
}: PartnerLinkedViewProps) {
  return (
    <View style={styles.root}>
      <Card>
        <View style={styles.linkedHeader}>
          <Text style={[typography.h2, { color: colors.text }]}>{partnerName}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: status === 'active' ? colors.tealTint : colors.roseTint },
            ]}>
            <Text style={[typography.captionMedium, { color: colors.text }]}>
              {status === 'active' ? 'Active' : 'Paused'}
            </Text>
          </View>
        </View>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Connected {formatConnectedDate(connectedAt)}
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button label="Manage sharing" onPress={onManageSharing} />
        {status === 'active' ? (
          <Button label="Pause sharing" variant="secondary" onPress={onPause} />
        ) : (
          <Button label="Resume sharing" variant="secondary" onPress={onResume} />
        )}
        <Button label="Revoke access" variant="ghost" onPress={onRevoke} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  linkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  actions: {
    gap: spacing.sm,
  },
});
