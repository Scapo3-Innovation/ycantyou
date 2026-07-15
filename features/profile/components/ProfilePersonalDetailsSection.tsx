import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { DateOfBirthField } from '@/components/ui/DateOfBirthField';
import { PremiumListItem } from '@/components/ui/PremiumListItem';
import { PremiumSection } from '@/components/ui/PremiumSection';
import { TextField } from '@/components/ui/TextField';
import { colors, radius, spacing, typography } from '@/theme';

type ProfilePersonalDetailsSectionProps = {
  fullName: string;
  dob: string;
  onChangeName: (value: string) => void;
  onChangeDob: (value: string) => void;
  nameError?: string;
  dobError?: string;
};

/** Personal details — separate premium cards for name and date of birth. */
export function ProfilePersonalDetailsSection({
  fullName,
  dob,
  onChangeName,
  onChangeDob,
  nameError,
  dobError,
}: ProfilePersonalDetailsSectionProps) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(fullName);

  function openNameEditor() {
    setDraftName(fullName);
    setEditingName(true);
  }

  function saveName() {
    onChangeName(draftName);
    setEditingName(false);
  }

  return (
    <PremiumSection label="Personal details">
      <PremiumListItem
        title="Full name"
        subtitle={fullName.trim() || 'Add your name'}
        leftIcon="person-outline"
        onPress={openNameEditor}
      />
      {nameError ? (
        <Text style={[typography.caption, styles.error, { color: colors.danger }]}>{nameError}</Text>
      ) : null}

      <Card style={styles.dobCard}>
        <DateOfBirthField
          label="Date of birth"
          value={dob}
          onChange={onChangeDob}
          error={dobError}
          variant="profileRow"
        />
      </Card>

      <Modal visible={editingName} transparent animationType="fade" onRequestClose={() => setEditingName(false)}>
        <Pressable style={styles.backdrop} onPress={() => setEditingName(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>Full name</Text>
            <TextField
              label="Full name"
              value={draftName}
              onChangeText={setDraftName}
              autoCapitalize="words"
              autoFocus
            />
            <Pressable
              onPress={saveName}
              accessibilityRole="button"
              style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}>
              <Text style={[typography.captionMedium, { color: colors.primaryText }]}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </PremiumSection>
  );
}

const styles = StyleSheet.create({
  dobCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  error: {
    paddingHorizontal: spacing.xs,
    marginTop: -spacing.xs,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  saveBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
  },
});
