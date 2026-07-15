import type { ImageSourcePropType } from 'react-native';

/** Partner tab imagery — stock photos for invite / share flows. */
export const partnerAssets = {
  inviteHero: require('@/assets/images/partner/invite-hero.jpg') as ImageSourcePropType,
  shareHero: require('@/assets/images/partner/share-hero.jpg') as ImageSourcePropType,
  supportHero: require('@/assets/images/partner/support-hero.jpg') as ImageSourcePropType,
} as const;
