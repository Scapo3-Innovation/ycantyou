import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CONTENT_RULES } from '@/features/community/constants';
import { colors, radius, shadows, spacing, typography } from '@/theme';

type CommunityRulesSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/** Community guidelines — custom bottom sheet (not system alert). */
export function CommunityRulesSheet({ visible, onClose }: CommunityRulesSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, shadows.glass, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
          onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.secondary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[typography.captionMedium, styles.eyebrow, { color: colors.textMuted }]}>
                Community
              </Text>
              <Text style={[typography.captionMedium, { color: colors.text, fontSize: 15 }]}>
                Rules & safety
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          <Text style={[typography.caption, styles.body, { color: colors.textMuted }]}>{CONTENT_RULES}</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}>
            <Text style={[typography.captionMedium, { color: colors.primaryText }]}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 1,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  body: {
    lineHeight: 20,
    fontSize: 13,
  },
  doneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: radius.control,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.9,
  },
});
