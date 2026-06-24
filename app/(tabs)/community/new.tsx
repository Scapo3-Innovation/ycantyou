import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { ContentRules } from '@/features/community/components/ContentRules';
import { useCreatePost } from '@/features/community/mutations';
import { parseTags, postSchema } from '@/features/community/validation';
import { colors, spacing, typography } from '@/theme';

export default function NewPostScreen() {
  const router = useRouter();
  const create = useCreatePost();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState<string>();

  function onSubmit() {
    setError(undefined);
    const parsed = postSchema.safeParse({
      title: title.trim() || undefined,
      body,
      tags: parseTags(tagsInput),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    create.mutate(
      { title: parsed.data.title ?? null, body: parsed.data.body, tags: parsed.data.tags },
      {
        onSuccess: () => router.back(),
        onError: () => setError('Could not post. Please try again.'),
      },
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ScreenHeader onBack={() => router.back()} />

          <ContentRules />

          <TextField
            label="Title (optional)"
            value={title}
            onChangeText={setTitle}
            placeholder="A short title"
            maxLength={120}
          />
          <TextField
            label="What would you like to share?"
            value={body}
            onChangeText={setBody}
            placeholder="Be supportive — no medical advice or promotion."
            multiline
            numberOfLines={6}
            style={styles.body}
          />
          <TextField
            label="Tags (optional, comma-separated)"
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="e.g. periods, support"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button label="Post" onPress={onSubmit} loading={create.isPending} />
            <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  body: {
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
});
