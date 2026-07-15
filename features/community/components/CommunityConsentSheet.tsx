import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { COMMUNITY_DISCLAIMER, CONTENT_RULES } from '@/features/community/constants';
import { colors, radius, spacing, typography } from '@/theme';

type CommunityConsentSheetProps = {
  visible: boolean;
  onAccept: () => void;
};

/** First-visit community guidelines and anonymity explanation. */
export function CommunityConsentSheet({ visible, onAccept }: CommunityConsentSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={[typography.h2, styles.title, { color: colors.text }]}>Welcome</Text>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            Community is a peer-support space. Posts are visible to other members. Use the
            incognito toggle when posting if you want to stay anonymous.
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{CONTENT_RULES}</Text>
          <Text style={[typography.caption, { color: colors.textFaint }]}>{COMMUNITY_DISCLAIMER}</Text>
          <Button label="I understand" onPress={onAccept} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
});
