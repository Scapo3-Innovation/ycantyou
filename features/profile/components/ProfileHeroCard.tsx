import { StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar';
import { colors, radius, shadows, spacing, typography } from '@/theme';

type ProfileHeroCardProps = {
  fullName: string | null;
  email?: string | null;
  isGuest: boolean;
  avatarUrl?: string | null;
};

function displayName(fullName: string | null): string {
  const trimmed = fullName?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : 'Add your name';
}

/** Profile hero card — avatar, verified badge, name, and email. */
export function ProfileHeroCard({ fullName, email, isGuest, avatarUrl }: ProfileHeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.decor, styles.decorTop]} />
      <View style={[styles.decor, styles.decorBottom]} />

      <View style={styles.row}>
        <ProfileAvatar avatarUrl={avatarUrl} size={56} />

        <View style={styles.copy}>
          {!isGuest ? (
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={12} color={colors.secondary} />
              <Text style={[typography.captionMedium, styles.badgeText, { color: colors.text }]}>
                Verified
              </Text>
            </View>
          ) : null}

          <Text style={[typography.bodyMedium, styles.name, { color: colors.primaryText }]}>
            {displayName(fullName)}
          </Text>

          {isGuest ? (
            <Text style={[typography.caption, { color: colors.primaryText, opacity: 0.88 }]}>
              Guest account
            </Text>
          ) : email ? (
            <Text style={[typography.caption, { color: colors.primaryText, opacity: 0.88 }]}>
              {email}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  decor: {
    position: 'absolute',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  decorTop: {
    width: 120,
    height: 120,
    top: -40,
    right: -20,
  },
  decorBottom: {
    width: 80,
    height: 80,
    bottom: -24,
    left: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
  },
  name: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    lineHeight: 24,
  },
});
