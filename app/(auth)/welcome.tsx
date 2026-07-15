import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { useHasSeenWelcome } from '@/features/onboarding/useHasSeenWelcome';
import { WELCOME_SLIDES, type WelcomeSlide } from '@/features/onboarding/welcomeSlides';
import { colors, radius, spacing, typography } from '@/theme';

const IMAGE_HEIGHT_RATIO = 0.48;
const AUTO_ADVANCE_MS = 5000;

export default function WelcomeScreen() {
  const router = useRouter();
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const forceShow = replay === '1';
  const { seen, markSeen } = useHasSeenWelcome();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const imageHeight = height * IMAGE_HEIGHT_RATIO;
  const listRef = useRef<FlatList<WelcomeSlide>>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (forceShow || seen !== true) return;
    router.replace('/(auth)/sign-in');
  }, [forceShow, seen, router]);

  useEffect(() => {
    if (!forceShow && seen !== false) return;

    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % WELCOME_SLIDES.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [forceShow, seen, index]);

  if (!forceShow && seen !== false) {
    return <SafeAreaView style={styles.safe} edges={['bottom']} />;
  }

  const isLast = index === WELCOME_SLIDES.length - 1;

  async function finish() {
    if (!forceShow) await markSeen();
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
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={WELCOME_SLIDES}
          keyExtractor={(item) => item.title}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: true,
            });
          }}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={[styles.imageWrap, { height: imageHeight }]}>
                <Image source={item.image} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)', colors.background]}
                  locations={[0.45, 0.78, 1]}
                  style={styles.imageFade}
                />
                <Pressable
                  onPress={() => void finish()}
                  accessibilityRole="button"
                  hitSlop={8}
                  style={[styles.skipButton, { top: insets.top + spacing.sm }]}>
                  <Text style={styles.skipLabel}>Skip</Text>
                </Pressable>
              </View>

              <View style={styles.copy}>
                <BrandLogo
                  variant="full"
                  size={Math.min(width - spacing.xl * 2, 280)}
                  style={styles.logo}
                />
                <Text style={[typography.display, styles.center, styles.title]}>{item.title}</Text>
                <Text style={[typography.body, styles.center, styles.body]}>{item.body}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {WELCOME_SLIDES.map((slide, i) => (
              <View
                key={slide.title}
                style={[
                  styles.dot,
                  i === index ? styles.dotActive : styles.dotInactive,
                  { backgroundColor: i === index ? colors.primary : colors.border },
                ]}
              />
            ))}
          </View>

          <Pressable
            onPress={onNext}
            accessibilityRole="button"
            style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}>
            <Text style={styles.nextLabel}>{isLast ? 'Get started' : 'Next'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    overflow: 'hidden',
  },
  imageFade: {
    ...StyleSheet.absoluteFill,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  skipLabel: {
    ...typography.bodyMedium,
    color: colors.primaryText,
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
  },
  body: {
    color: colors.textMuted,
  },
  center: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
  dotInactive: {
    width: 8,
  },
  dotActive: {
    width: 28,
  },
  nextButton: {
    minWidth: 132,
    minHeight: 52,
    borderRadius: radius.control,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  nextButtonPressed: {
    opacity: 0.85,
  },
  nextLabel: {
    ...typography.button,
    color: colors.text,
  },
});
