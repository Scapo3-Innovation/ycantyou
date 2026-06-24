import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { colors, spacing } from '@/theme';

/** Full-screen boot gate — brand mark while auth/session restores. */
export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <BrandLogo variant="icon" size={88} />
      <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  spinner: {
    marginTop: spacing.sm,
  },
});
