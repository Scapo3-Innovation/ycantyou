import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type HeroBannerProps = {
  image: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  /** Smaller hero for compact forms (e.g. sign-in, onboarding). */
  compact?: boolean;
  /** Override photo area height (excluding topInset). */
  photoHeight?: number;
  /** Safe-area inset so the photo runs edge-to-edge under the status bar. */
  topInset?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Space below title/subtitle inside the hero. */
  copyBottomInset?: number;
  /** Extend title block below the hero into the content area. */
  copyOverlap?: number;
};

/** Full-bleed photo header with gradient fade into the screen background. */
export function HeroBanner({
  image,
  title,
  subtitle,
  compact = false,
  photoHeight,
  topInset = 0,
  icon,
  copyBottomInset,
  copyOverlap,
}: HeroBannerProps) {
  const resolvedPhotoHeight = photoHeight ?? (compact ? 268 : 320);
  const showCopy = Boolean(title || subtitle || icon);
  const copyOverlaps = copyOverlap != null && copyOverlap > 0;

  return (
    <View
      style={[
        styles.wrap,
        copyOverlaps && styles.wrapOverlap,
        { height: resolvedPhotoHeight + topInset, paddingTop: topInset },
      ]}>
      <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.35)', colors.background]}
        locations={[0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      {showCopy ? (
        <View
          style={[
            styles.copy,
            copyOverlaps && styles.copyOverlap,
            {
              paddingBottom: copyBottomInset ?? spacing.md,
              bottom: copyOverlaps ? -copyOverlap : undefined,
            },
          ]}>
          {icon ? (
            <View style={styles.iconBadge}>
              <Ionicons name={icon} size={22} color={colors.primary} />
            </View>
          ) : null}
          {title ? <Text style={[typography.h1, styles.title]}>{title}</Text> : null}
          {subtitle ? <Text style={[typography.body, styles.subtitle]}>{subtitle}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
  },
  wrapOverlap: {
    overflow: 'visible',
  },
  copy: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  copyOverlap: {
    position: 'absolute',
    left: 0,
    right: 0,
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
