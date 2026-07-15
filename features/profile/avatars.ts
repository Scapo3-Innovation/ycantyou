import type { Ionicons } from '@expo/vector-icons';

/** Default bloom preset — shown when the user has no custom photo. */
export const DEFAULT_PROFILE_AVATAR_ID = 'bloom' as const;

export type ProfileAvatarId = typeof DEFAULT_PROFILE_AVATAR_ID;

export type ProfileAvatarPreset = {
  id: ProfileAvatarId;
  label: string;
  backgroundColor: string;
  iconColor: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const BLOOM_AVATAR_PRESET: ProfileAvatarPreset = {
  id: 'bloom',
  label: 'Bloom',
  backgroundColor: '#FCECF1',
  iconColor: '#E76A8A',
  icon: 'flower-outline',
};

export function resolveProfileAvatarId(value: string | null | undefined): ProfileAvatarId {
  return value === 'bloom' ? 'bloom' : DEFAULT_PROFILE_AVATAR_ID;
}

export function profileAvatarPreset(_id?: string | null): ProfileAvatarPreset {
  return BLOOM_AVATAR_PRESET;
}
