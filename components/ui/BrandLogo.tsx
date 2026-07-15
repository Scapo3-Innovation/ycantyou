import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { BRAND_NAME, BRAND_TAGLINE, LOGO_FULL_ASPECT, LOGO_ICON_ASPECT, brandAssets } from '@/features/brand/assets';
import { colors, spacing, typography } from '@/theme';

type BrandLogoProps = {
  /** Full horizontal lockup, icon only, or text-only wordmark. */
  variant?: 'full' | 'icon' | 'wordmark';
  /** Icon / full-logo width in dp. Height scales from aspect ratio. */
  size?: number;
  style?: StyleProp<ImageStyle>;
  /** Show tagline under the wordmark (wordmark variant only). */
  showTagline?: boolean;
};

/**
 * ycantyou brand mark — use `full` on splash/auth, `icon` in compact headers,
 * `wordmark` when space is tight but text is needed.
 */
export function BrandLogo({
  variant = 'full',
  size = 160,
  style,
  showTagline = true,
}: BrandLogoProps) {
  if (variant === 'wordmark') {
    return (
      <View style={[styles.wordmark, style]}>
        <Text style={styles.name}>{BRAND_NAME}</Text>
        {showTagline ? (
          <Text style={[typography.caption, styles.tagline]}>{BRAND_TAGLINE}</Text>
        ) : null}
      </View>
    );
  }

  const source = variant === 'full' ? brandAssets.logoFull : brandAssets.logoIcon;
  const aspect = variant === 'full' ? LOGO_FULL_ASPECT : LOGO_ICON_ASPECT;
  const height = size / aspect;

  return (
    <Image
      source={source}
      style={[{ width: size, height }, style]}
      contentFit="contain"
      accessibilityRole="image"
      accessibilityLabel={`${BRAND_NAME} logo`}
    />
  );
}

const styles = StyleSheet.create({
  wordmark: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.h1,
    color: colors.text,
    letterSpacing: -0.5,
    textTransform: 'lowercase',
  },
  tagline: {
    color: colors.secondary,
    textAlign: 'center',
  },
});
