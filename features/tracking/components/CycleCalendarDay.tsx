import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import type { DayVisual } from '@/features/tracking/calendarVisual';
import { colors, radius, typography } from '@/theme';

type CycleCalendarDayProps = {
  date: string;
  dayNumber: number;
  visual: DayVisual;
  variant: 'month' | 'year';
  onPress: (date: string) => void;
};

const MONTH_BUBBLE = 36;
const YEAR_BUBBLE = 16;

/** Single calendar cell styled for logged period, fertile window, and estimates. */
export function CycleCalendarDay({
  date,
  dayNumber,
  visual,
  variant,
  onPress,
}: CycleCalendarDayProps) {
  const isMonth = variant === 'month';
  const bubbleSize = isMonth ? MONTH_BUBBLE : YEAR_BUBBLE;
  const { kind, isSelected } = visual;

  let textColor: string = colors.text;
  if (isMonth && kind === 'period') {
    textColor = colors.primaryText;
  } else if (kind === 'fertile' || kind === 'predicted' || kind === 'ovulation') {
    textColor = colors.secondary;
  }

  const bubbleStyles: ViewStyle[] = [styles.bubble, { width: bubbleSize, height: bubbleSize }];

  if (isMonth) {
    if (kind === 'period') {
      bubbleStyles.push({
        backgroundColor: colors.primary,
        borderRadius: radius.full,
      });
    } else if (isSelected) {
      bubbleStyles.push({
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.secondary,
        borderRadius: radius.full,
      });
    }
  } else if (kind === 'period') {
    bubbleStyles.push({
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.primary,
      borderRadius: radius.full,
    });
  } else if (kind === 'fertile' || kind === 'ovulation') {
    bubbleStyles.push({
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.secondary,
      borderRadius: radius.full,
    });
  }

  return (
    <Pressable
      style={[styles.cell, isMonth ? styles.monthCell : styles.yearCell]}
      onPress={() => onPress(date)}
      accessibilityRole="button"
      accessibilityLabel={`${dayNumber}`}>
      <View style={bubbleStyles}>
        <Text
          style={[
            isMonth ? typography.body : typography.caption,
            styles.dayText,
            {
              color: textColor,
              fontSize: isMonth ? 15 : 9,
              lineHeight: isMonth ? 18 : 11,
            } satisfies TextStyle,
          ]}>
          {dayNumber}
        </Text>
      </View>
      {isMonth && kind === 'ovulation' ? (
        <Ionicons name="heart" size={8} color={colors.primary} style={styles.heart} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCell: {
    width: `${100 / 7}%`,
    minHeight: 44,
    paddingVertical: 2,
  },
  yearCell: {
    width: `${100 / 7}%`,
    minHeight: 18,
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    textAlign: 'center',
  },
  heart: {
    marginTop: 1,
  },
});
