import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
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
import { Screen } from '@/components/ui/Screen';
import { IncognitoToggle } from '@/features/community/components/IncognitoToggle';
import { COMMUNITY_DISCLAIMER, TOPIC_TAGS } from '@/features/community/constants';
import { useCreatePost } from '@/features/community/mutations';
import { parseTags, postSchema } from '@/features/community/validation';
import { useAuth } from '@/features/auth/AuthProvider';
import { profileFirstName } from '@/features/profile/firstName';
import { useProfile } from '@/features/profile/useProfile';
import { analytics } from '@/lib/analytics';
import { colors, radius, spacing, typography } from '@/theme';

export default function NewPostScreen() {
  const router = useRouter();
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
      Alert.alert(
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
    <Screen edgeToEdge>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
            <Text style={[typography.body, { color: colors.text }]}>Cancel</Text>
          </Pressable>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>New post</Text>
          <Pressable
            onPress={onSubmit}
            disabled={!canPost}
            accessibilityRole="button"
            accessibilityLabel="Post"
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}>
            <Text
              style={[
                typography.bodyMedium,
                { color: canPost ? colors.primaryText : colors.textFaint },
              ]}>
              Post
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.composeRow}>
            <View style={[styles.avatar, { backgroundColor: colors.roseTint }]}>
              <Text style={[typography.bodyMedium, { color: colors.primary }]}>{userInitial}</Text>
            </View>
            <View style={styles.composeCol}>
              <IncognitoToggle value={isAnonymous} onChange={onIncognitoChange} />
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder="What's happening?"
                placeholderTextColor={colors.textFaint}
                multiline
                autoFocus
                style={[styles.composeInput, { color: colors.text }]}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.topics}>
            {TOPIC_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                selected={selectedTopics.includes(tag)}
                onPress={() => toggleTopic(tag)}
              />
            ))}
          </View>

          {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}

          <Text style={[typography.caption, { color: colors.textFaint }]}>{COMMUNITY_DISCLAIMER}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  postBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minWidth: 64,
    alignItems: 'center',
  },
  postBtnDisabled: {
    backgroundColor: colors.surfaceAlt,
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  composeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeCol: {
    flex: 1,
    gap: spacing.sm,
  },
  composeInput: {
    fontSize: 20,
    lineHeight: 28,
    minHeight: 120,
    padding: 0,
    fontFamily: typography.body.fontFamily,
  },
  topics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
