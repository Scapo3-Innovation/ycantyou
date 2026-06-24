import type { ViewProps } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type ScreenProps = ViewProps & {
  /** When true, content spans the full screen width (hero images edge-to-edge). */
  edgeToEdge?: boolean;
};

/**
 * Base screen primitive: a themed, safe-area-aware container with generous horizontal padding.
 * Every screen should render its content inside a <Screen>.
 */
export function Screen({ style, children, edgeToEdge = false, ...rest }: ScreenProps) {
  const safeEdges: Edge[] = edgeToEdge ? ['bottom'] : ['top', 'bottom'];

  return (
    <SafeAreaView style={styles.safe} edges={safeEdges}>
      <View style={[styles.content, edgeToEdge && styles.contentEdgeToEdge, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

/** Horizontal inset for content below a full-bleed hero. */
export const screenBodyPadding = {
  paddingHorizontal: spacing.xl,
} as const;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  contentEdgeToEdge: {
    paddingHorizontal: 0,
  },
});
