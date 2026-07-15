import { profileFirstName } from '@/features/profile/firstName';

/** Resolve how an author appears in the community feed. */
export function resolveAuthorLabel(params: {
  isOwn: boolean;
  isAnonymous: boolean;
  authorFullName?: string | null;
}): string {
  if (params.isOwn) return 'You';
  if (params.isAnonymous) return 'Anonymous';
  const name = profileFirstName(params.authorFullName);
  return name === 'there' ? 'Community member' : name;
}
