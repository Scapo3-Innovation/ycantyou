const TAG_LABELS: Record<string, string> = {
  period: 'Period',
  mood: 'Mood',
  pcos: 'PCOS',
  support: 'Support',
};

export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag.charAt(0).toUpperCase() + tag.slice(1);
}
