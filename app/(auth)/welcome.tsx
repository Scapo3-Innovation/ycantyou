import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useHasSeenWelcome } from '@/features/onboarding/useHasSeenWelcome';
import { WELCOME_SLIDES, type WelcomeSlide } from '@/features/onboarding/welcomeSlides';
import { colors, radius, spacing, typography } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { seen, markSeen } = useHasSeenWelcome();
  const { width } = useWindowDimensions();
  const itemWidth = width - spacing.xl * 2; // Screen has spacing.xl horizontal padding
  const listRef = useRef<FlatList<WelcomeSlide>>(null);
  const [index, setIndex] = useState(0);

  // Returning (signed-out) users skip the carousel.
  useEffect(() => {
    if (seen === true) router.replace('/(auth)/sign-in');
  }, [seen, router]);

  if (seen !== false) return <Screen />; // loading or redirecting

  const isLast = index === WELCOME_SLIDES.length - 1;

  async function finish() {
    await markSeen();
    router.replace('/(auth)/sign-in');
  }

  function onNext() {
    if (isLast) {
      void finish();
    } else {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  }

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / itemWidth));
  }

  return (
    <Screen>
      <View style={styles.skipRow}>
        <Pressable onPress={() => void finish()} accessibilityRole="button" hitSlop={8}>
          <Text style={[typography.bodyMedium, { color: colors.textMuted }]}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={WELCOME_SLIDES}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: itemWidth, offset: itemWidth * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: itemWidth }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name={item.icon} size={44} color={colors.primary} />
            </View>
            <Text style={[typography.display, styles.center, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[typography.body, styles.center, { color: colors.textMuted }]}>
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {WELCOME_SLIDES.map((slide, i) => (
          <View
            key={slide.title}
            style={[
              styles.dot,
              { backgroundColor: i === index ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>

      <Button label={isLast ? 'Get started' : 'Next'} onPress={onNext} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  skipRow: {
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
    minHeight: 40,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
});
