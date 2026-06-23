import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { colors } from '@/theme';

/** Full-screen centered spinner — used as the boot/splash gate while auth restores. */
export function LoadingScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
