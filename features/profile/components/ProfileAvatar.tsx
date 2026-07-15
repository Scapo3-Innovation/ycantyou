import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { profileAvatarPreset } from '@/features/profile/avatars';
import { colors } from '@/theme';

type ProfileAvatarProps = {
  avatarUrl?: string | null;
  size?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

/** Profile avatar — custom photo URL or bloom default preset (display only). */
export function ProfileAvatar({
  avatarUrl,
  size = 56,
  style,
  accessibilityLabel = 'Profile photo',
}: ProfileAvatarProps) {
  const preset = profileAvatarPreset();
  const radius = size / 2;
  const iconSize = Math.round(size * 0.46);
  const hasPhoto = Boolean(avatarUrl?.trim());

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: hasPhoto ? colors.surface : preset.backgroundColor,
        },
        style,
      ]}>
      {hasPhoto ? (
        <Image
          source={{ uri: avatarUrl! }}
          style={{ width: size, height: size, borderRadius: radius }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <Ionicons name={preset.icon} size={iconSize} color={preset.iconColor} />
      )}
    </View>
  );
}

/** Compact avatar for headers. */
export function ProfileAvatarChip({
  avatarUrl,
  size = 36,
}: {
  avatarUrl?: string | null;
  size?: number;
}) {
  return <ProfileAvatar avatarUrl={avatarUrl} size={size} />;
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
