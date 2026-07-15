import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { format, isValid, parseISO } from 'date-fns';
import { createElement, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type DateOfBirthFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  variant?: 'default' | 'profileRow';
};

const MIN_DATE = new Date(1920, 0, 1);

function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function parseDob(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

function formatDisplay(value: string): string {
  const parsed = parseDob(value);
  return parsed ? format(parsed, 'd MMMM yyyy') : '';
}

/** Date of birth picker — calendar on tap (native dialog / iOS sheet / browser date input on web). */
export function DateOfBirthField({
  label,
  value,
  onChange,
  error,
  placeholder = 'Tap to choose date',
  variant = 'default',
}: DateOfBirthFieldProps) {
  const c = colors;
  const [showPicker, setShowPicker] = useState(false);
  const maxDate = useMemo(() => new Date(), []);
  const selectedDate = useMemo(() => parseDob(value) ?? new Date(2000, 0, 1), [value]);
  const displayValue = formatDisplay(value);

  function onDateSelected(_event: DateTimePickerChangeEvent, date: Date) {
    onChange(toIsoDate(date));
    if (Platform.OS === 'android') setShowPicker(false);
  }

  function onPickerDismiss() {
    setShowPicker(false);
  }

  function confirmIosDate() {
    setShowPicker(false);
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {variant === 'default' ? (
          <Text style={[typography.captionMedium, { color: c.textMuted }]}>{label}</Text>
        ) : null}
        <View
          style={[
            variant === 'profileRow' ? styles.profileRow : styles.inputRow,
            { backgroundColor: c.surface, borderColor: error ? c.danger : c.border },
            variant === 'profileRow' && { borderWidth: 0 },
          ]}>
          {createElement('input', {
            type: 'date',
            value,
            onChange: (event: { target: { value: string } }) => onChange(event.target.value),
            max: toIsoDate(maxDate),
            min: toIsoDate(MIN_DATE),
            'aria-label': label,
            style: {
              flex: 1,
              minHeight: 48,
              borderWidth: 0,
              padding: 0,
              fontSize: typography.body.fontSize,
              fontFamily: typography.body.fontFamily,
              lineHeight: `${typography.body.lineHeight}px`,
              color: c.text,
              backgroundColor: 'transparent',
            },
          })}
          <Ionicons name="calendar-outline" size={20} color={c.textMuted} />
        </View>
        {error ? (
          <Text style={[typography.caption, { color: c.danger }]} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {variant === 'default' ? (
        <Text style={[typography.captionMedium, { color: c.textMuted }]}>{label}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Opens calendar to choose your date of birth"
        onPress={() => setShowPicker(true)}
        style={[
          variant === 'profileRow' ? styles.profileRow : styles.inputRow,
          { backgroundColor: c.surface, borderColor: error ? c.danger : c.border },
          variant === 'profileRow' && { borderWidth: 0, paddingHorizontal: 0, minHeight: 0 },
        ]}>
        {variant === 'profileRow' ? (
          <View style={styles.profileCopy}>
            <Text style={[typography.caption, { color: c.textMuted }]}>{label}</Text>
            <Text
              style={[
                typography.bodyMedium,
                { color: displayValue ? c.text : c.textMuted },
              ]}>
              {displayValue || placeholder}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              typography.body,
              styles.valueText,
              { color: displayValue ? c.text : c.textMuted },
            ]}>
            {displayValue || placeholder}
          </Text>
        )}
        <Ionicons name="calendar-outline" size={20} color={c.secondary} />
      </Pressable>

      {error ? (
        <Text style={[typography.caption, { color: c.danger }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          mode="date"
          display="calendar"
          value={selectedDate}
          onValueChange={onDateSelected}
          onDismiss={onPickerDismiss}
          maximumDate={maxDate}
          minimumDate={MIN_DATE}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="slide" onRequestClose={confirmIosDate}>
          <Pressable style={styles.backdrop} onPress={confirmIosDate}>
            <Pressable
              style={[styles.sheet, { backgroundColor: c.surface }]}
              onPress={(event) => event.stopPropagation()}>
              <View style={styles.sheetHeader}>
                <Text style={[typography.bodyMedium, { color: c.text }]}>Date of birth</Text>
                <Pressable onPress={confirmIosDate} hitSlop={8}>
                  <Text style={[typography.bodyMedium, { color: c.primary }]}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                mode="date"
                display="inline"
                value={selectedDate}
                onValueChange={onDateSelected}
                maximumDate={maxDate}
                minimumDate={MIN_DATE}
                themeVariant="light"
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  inputRow: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    flex: 1,
  },
  profileRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  profileCopy: {
    flex: 1,
    gap: 2,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
