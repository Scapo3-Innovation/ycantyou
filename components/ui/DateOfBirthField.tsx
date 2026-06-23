import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, isValid, parseISO } from 'date-fns';
import { createElement, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type DateOfBirthFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
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
  placeholder = 'Select your date of birth',
}: DateOfBirthFieldProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  const [showPicker, setShowPicker] = useState(false);
  const maxDate = useMemo(() => new Date(), []);
  const selectedDate = useMemo(() => parseDob(value) ?? new Date(2000, 0, 1), [value]);
  const displayValue = formatDisplay(value);

  function onDateChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'dismissed') return;
    }
    if (date) onChange(toIsoDate(date));
  }

  function confirmIosDate() {
    setShowPicker(false);
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={[typography.caption, styles.label, { color: c.textMuted }]}>{label}</Text>
        <View
          style={[
            styles.inputRow,
            { backgroundColor: c.surface, borderColor: error ? c.danger : c.border },
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
              fontWeight: typography.body.fontWeight,
              lineHeight: `${typography.body.lineHeight}px`,
              color: c.text,
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
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
      <Text style={[typography.caption, styles.label, { color: c.textMuted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Opens calendar to choose your date of birth"
        onPress={() => setShowPicker(true)}
        style={[
          styles.inputRow,
          { backgroundColor: c.surface, borderColor: error ? c.danger : c.border },
        ]}>
        <Text
          style={[
            typography.body,
            styles.valueText,
            { color: displayValue ? c.text : c.textMuted },
          ]}>
          {displayValue || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={c.textMuted} />
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
          onChange={onDateChange}
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
                <Text style={[typography.body, { color: c.text, fontWeight: '600' }]}>
                  Date of birth
                </Text>
                <Pressable onPress={confirmIosDate} hitSlop={8}>
                  <Text style={[typography.body, { color: c.primary, fontWeight: '600' }]}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                mode="date"
                display="inline"
                value={selectedDate}
                onChange={onDateChange}
                maximumDate={maxDate}
                minimumDate={MIN_DATE}
                themeVariant={scheme}
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
  label: {
    fontWeight: '600',
  },
  inputRow: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    flex: 1,
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
