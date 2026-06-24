import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

/** Hairline divider. Pass a style for vertical margins. */
export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
