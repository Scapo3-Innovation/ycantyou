import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { useAppDialog } from '@/components/ui/AppDialogProvider';
import { Screen } from '@/components/ui/Screen';
import { IncognitoToggle } from '@/features/community/components/IncognitoToggle';
import { COMMUNITY_DISCLAIMER, TOPIC_TAGS } from '@/features/community/constants';
import { useCreatePost } from '@/features/community/mutations';
import { postSchema } from '@/features/community/validation';
import { useAuth } from '@/features/auth/AuthProvider';
import { profileFirstName } from '@/features/profile/firstName';
import { useProfile } from '@/features/profile/useProfile';
import { analytics } from '@/lib/analytics';
import { colors, floatingTabBarScrollInset, radius, spacing, typography } from '@/theme';

const HEADER_SIDE_WIDTH = 76;

export default function NewPostScreen() {
  const router = useRouter();
  const { alert } = useAppDialog();
  const create = useCreatePost();
  const { session } = useAuth();
  const { data: profile } = useProfile(session?.user.id);

  const [body, setBody] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState<string>();

  const userInitial = useMemo(() => {
    const name = profileFirstName(profile?.full_name);
    if (name === 'there') return 'Y';
    return name.charAt(0).toUpperCase();
  }, [profile?.full_name]);

  function toggleTopic(tag: string) {
    setSelectedTopics((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag].slice(0, 5),
    );
  }

  function onIncognitoChange(next: boolean) {
    setIsAnonymous(next);
    analytics.track('community_incognito_toggled', { anonymous: next });
  }

  function submitPost() {
    create.mutate(
      {
        title: null,
        body: body.trim(),
        tags: selectedTopics,
        is_anonymous: isAnonymous,
      },
      {
        onSuccess: () => router.back(),
        onError: () => setError('Could not post. Please try again.'),
      },
    );
  }

  function onSubmit() {
    setError(undefined);
    const parsed = postSchema.safeParse({ body, tags: selectedTopics });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }

    if (!isAnonymous) {
      alert(
        'Post with your first name?',
        'Other members will see your first name on this post.',
        [
          { text: 'Go back', style: 'cancel' },
          { text: 'Post', onPress: submitPost },
        ],
      );
      return;
    }

    submitPost();
  }

  const canPost = body.trim().length > 0 && !create.isPending;

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={({ pressed }) => [styles.headerSide, pressed && styles.pressed]}>
            <Text style={[typography.bodyMedium, styles.cancelLabel]}>Cancel</Text>
          </Pressable>

          <Text style={[typography.bodyMedium, styles.headerTitle]} numberOfLines={1}>
            New post
          </Text>

          <Pressable
            onPress={onSubmit}
            disabled={!canPost}
            accessibilityRole="button"
            accessibilityLabel="Post"
            accessibilityState={{ disabled: !canPost, busy: create.isPending }}
            style={({ pressed }) => [
              styles.headerSide,
              styles.postBtn,
              canPost ? styles.postBtnActive : styles.postBtnDisabled,
              pressed && canPost && styles.pressed,
            ]}>
            {create.isPending ? (
              <ActivityIndicator size="small" color={colors.primaryText} />
            ) : (
              <Text
                style={[
                  typography.button,
                  { color: canPost ? colors.primaryText : colors.textMuted },
                ]}>
                Post
              </Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.identityRow}>
            <View style={[styles.avatar, { backgroundColor: colors.roseTint }]}>
              <Text style={[typography.bodyMedium, { color: colors.primary }]}>{userInitial}</Text>
            </View>
            <View style={styles.identityToggle}>
              <IncognitoToggle value={isAnonymous} onChange={onIncognitoChange} />
            </View>
          </View>

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="What's happening?"
            placeholderTextColor={colors.textFaint}
            multiline
            autoFocus
            style={[typography.body, styles.composeInput, { color: colors.text }]}
            textAlignVertical="top"
          />

          <View style={styles.topics}>
            <Text style={[typography.captionMedium, styles.topicsLabel, { color: colors.textMuted }]}>
              Add a topic
            </Text>
            <View style={styles.topicRow}>
              {TOPIC_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  selected={selectedTopics.includes(tag)}
                  onPress={() => toggleTopic(tag)}
                />
              ))}
            </View>
          </View>

          {error ? (
            <Text style={[typography.caption, { color: colors.danger }]} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}

          <Text style={[typography.caption, styles.disclaimer, { color: colors.textFaint }]}>
            {COMMUNITY_DISCLAIMER}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerSide: {
    width: HEADER_SIDE_WIDTH,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
  },
  cancelLabel: {
    color: colors.primary,
  },
  postBtn: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  postBtnActive: {
    backgroundColor: colors.primary,
  },
  postBtnDisabled: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: floatingTabBarScrollInset + spacing.lg,
    gap: spacing.md,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  identityToggle: {
    flex: 1,
    minWidth: 0,
  },
  composeInput: {
    minHeight: 140,
    padding: 0,
    lineHeight: 22,
  },
  topics: {
    gap: spacing.sm,
  },
  topicsLabel: {
    paddingHorizontal: spacing.xs,
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  disclaimer: {
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.88,
  },
});
