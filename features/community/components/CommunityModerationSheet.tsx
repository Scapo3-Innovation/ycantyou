import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { REPORT_REASONS } from '@/features/community/constants';
import type { FeedPost, PostComment } from '@/features/community/types';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export type ModerationMenuTarget =
  | { type: 'post'; post: FeedPost }
  | { type: 'comment'; comment: PostComment };

type SheetStep = 'menu' | 'report' | 'confirm-block' | 'confirm-delete';

type CommunityModerationSheetProps = {
  target: ModerationMenuTarget | null;
  isFollowing: boolean;
  onClose: () => void;
  onFollow: () => void;
  onUnfollow: () => void;
  onReport: (reason: string) => void;
  onBlock: () => void;
  onDelete?: () => void;
};

function targetAuthorLabel(target: ModerationMenuTarget): string {
  return target.type === 'post' ? target.post.authorLabel : target.comment.authorLabel;
}

function targetIsOwn(target: ModerationMenuTarget): boolean {
  return target.type === 'post' ? target.post.isOwn : target.comment.isOwn;
}

/** Bottom sheet for post/comment options — report, block, follow, delete. */
export function CommunityModerationSheet({
  target,
  isFollowing,
  onClose,
  onFollow,
  onUnfollow,
  onReport,
  onBlock,
  onDelete,
}: CommunityModerationSheetProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<SheetStep>('menu');

  useEffect(() => {
    if (target) setStep('menu');
  }, [target]);

  function close() {
    setStep('menu');
    onClose();
  }

  function onPickReport(reason: string) {
    onReport(reason);
    close();
  }

  function onConfirmBlock() {
    onBlock();
    close();
  }

  function onConfirmDelete() {
    onDelete?.();
    close();
  }

  const author = target ? targetAuthorLabel(target) : '';
  const isOwn = target ? targetIsOwn(target) : false;

  return (
    <Modal visible={target != null} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable
          style={[styles.sheet, shadows.glass, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
          onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />

          {step === 'menu' ? (
            <>
              <Text style={[typography.sectionEyebrow, styles.eyebrow, { color: colors.textFaint }]}>
                {target?.type === 'comment' ? 'Comment options' : 'Post options'}
              </Text>
              <Text style={[styles.sheetTitle, { color: colors.text }]} numberOfLines={1}>
                {isOwn ? (target?.type === 'comment' ? 'Your comment' : 'Your post') : author}
              </Text>

              {isOwn ? (
                <SheetAction
                  icon="trash-outline"
                  label={target?.type === 'comment' ? 'Delete comment' : 'Delete post'}
                  subtitle={
                    target?.type === 'comment'
                      ? 'Removes your comment for everyone'
                      : 'Removes this post for everyone'
                  }
                  destructive
                  onPress={() => setStep('confirm-delete')}
                />
              ) : (
                <>
                  <SheetAction
                    icon={isFollowing ? 'person-remove-outline' : 'person-add-outline'}
                    label={isFollowing ? 'Unfollow' : 'Follow'}
                    subtitle={
                      isFollowing
                        ? 'Stop seeing their posts in Following'
                        : 'See their posts in your Following tab'
                    }
                    accent={!isFollowing}
                    onPress={() => {
                      if (isFollowing) onUnfollow();
                      else onFollow();
                      close();
                    }}
                  />
                  <SheetAction
                    icon="flag-outline"
                    label="Report"
                    subtitle="Flag content for review"
                    onPress={() => setStep('report')}
                  />
                  <SheetAction
                    icon="ban-outline"
                    label="Block author"
                    subtitle="Hide their posts and comments"
                    destructive
                    onPress={() => setStep('confirm-block')}
                  />
                </>
              )}

              <Pressable
                onPress={close}
                accessibilityRole="button"
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}>
                <Text style={[typography.captionMedium, { color: colors.textMuted }]}>Cancel</Text>
              </Pressable>
            </>
          ) : null}

          {step === 'report' ? (
            <>
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setStep('menu')} hitSlop={8} accessibilityRole="button">
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </Pressable>
                <Text style={[typography.captionMedium, styles.headerTitle, { color: colors.text }]}>
                  Report content
                </Text>
                <View style={styles.headerSpacer} />
              </View>
              <Text style={[typography.caption, styles.reportHint, { color: colors.textMuted }]}>
                Choose a reason — our team will review it.
              </Text>
              {REPORT_REASONS.map((reason) => (
                <SheetAction
                  key={reason}
                  icon="alert-circle-outline"
                  label={reason}
                  onPress={() => onPickReport(reason)}
                />
              ))}
            </>
          ) : null}

          {step === 'confirm-block' ? (
            <ConfirmPanel
              icon="ban-outline"
              title="Block this author?"
              body="Their posts and comments will be hidden from you. You can unblock later from settings."
              confirmLabel="Block"
              onCancel={() => setStep('menu')}
              onConfirm={onConfirmBlock}
            />
          ) : null}

          {step === 'confirm-delete' ? (
            <ConfirmPanel
              icon="trash-outline"
              title={target?.type === 'comment' ? 'Delete this comment?' : 'Delete this post?'}
              body={
                target?.type === 'comment'
                  ? 'This removes your comment for everyone.'
                  : 'This removes your post for everyone.'
              }
              confirmLabel="Delete"
              onCancel={() => setStep('menu')}
              onConfirm={onConfirmDelete}
            />
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SheetAction({
  icon,
  label,
  subtitle,
  destructive = false,
  accent = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  destructive?: boolean;
  accent?: boolean;
  onPress: () => void;
}) {
  const tint = destructive ? colors.danger : colors.text;
  const iconBg = destructive
    ? colors.roseTint
    : accent
      ? colors.roseTint
      : colors.surfaceAlt;
  const iconColor = destructive ? colors.danger : accent ? colors.primary : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
      <View style={[styles.actionIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={[typography.captionMedium, styles.actionLabel, { color: tint }]}>{label}</Text>
        {subtitle ? (
          <Text style={[typography.caption, styles.actionSubtitle, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
    </Pressable>
  );
}

function ConfirmPanel({
  icon,
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <View style={styles.confirmWrap}>
      <View style={styles.confirmIconWrap}>
        <Ionicons name={icon} size={20} color={colors.danger} />
      </View>
      <Text style={[typography.captionMedium, styles.confirmTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[typography.caption, styles.confirmBody, { color: colors.textMuted }]}>{body}</Text>
      <View style={styles.confirmActions}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          style={({ pressed }) => [styles.confirmSecondary, pressed && styles.pressed]}>
          <Text style={[typography.captionMedium, { color: colors.text }]}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          accessibilityRole="button"
          style={({ pressed }) => [styles.confirmPrimary, pressed && styles.pressed]}>
          <Text style={[typography.captionMedium, { color: colors.primaryText }]}>{confirmLabel}</Text>
        </Pressable>
      </View>
    </View>
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
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  eyebrow: {
    marginBottom: spacing.xs,
  },
  sheetTitle: {
    fontFamily: typography.bodyMedium.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 14,
  },
  headerSpacer: {
    width: 20,
  },
  reportHint: {
    marginBottom: spacing.xs,
    fontSize: 12,
    lineHeight: 17,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 52,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
    gap: 1,
  },
  actionLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  confirmWrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  confirmIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  confirmBody: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
  confirmSecondary: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  confirmPrimary: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  pressed: {
    opacity: 0.88,
  },
});
