import type { ImageSourcePropType } from 'react-native';

export type WelcomeSlide = {
  image: ImageSourcePropType;
  title: string;
  body: string;
};

/** The 2–3 intro slides shown before sign-in. */
export const WELCOME_SLIDES: readonly WelcomeSlide[] = [
  {
    image: require('../../assets/images/welcome/cycle.jpg'),
    title: 'Understand your cycle',
    body: 'Track your periods and symptoms and learn what your body is telling you — honestly, even when cycles are irregular.',
  },
  {
    image: require('../../assets/images/welcome/privacy.jpg'),
    title: 'Private by design',
    body: 'Your health data is yours. We collect only what a feature needs and never sell it. Export or delete everything anytime.',
  },
  {
    image: require('../../assets/images/welcome/screening.jpg'),
    title: 'Screening, not diagnosis',
    body: 'Our PCOS screener helps you decide whether to see a clinician. It never diagnoses — only a doctor can.',
  },
];
