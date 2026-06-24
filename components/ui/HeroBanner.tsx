import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type HeroBannerProps = {
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
  /** Smaller hero for compact forms (e.g. sign-in, onboarding). */
  compact?: boolean;
  /** Safe-area inset so the photo runs edge-to-edge under the status bar. */
  topInset?: number;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** Full-bleed photo header with gradient fade into the screen background. */
export function HeroBanner({
  image,
  title,
  subtitle,
  compact = false,
  topInset = 0,
  icon,
}: HeroBannerProps) {
  const photoHeight = compact ? 268 : 320;

  return (
    <View style={[styles.wrap, { height: photoHeight + topInset, paddingTop: topInset }]}>
      <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.35)', colors.background]}
        locations={[0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.copy}>
        {icon ? (
          <View style={styles.iconBadge}>
            <Ionicons name={icon} size={22} color={colors.primary} />
          </View>
        ) : null}
        <Text style={[typography.h1, styles.title]}>{title}</Text>
        {subtitle ? <Text style={[typography.body, styles.subtitle]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
});
