import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

/** Full-screen centered spinner — used as the boot/splash gate while auth restores. */
export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
