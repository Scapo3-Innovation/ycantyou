import { PremiumListItem } from '@/components/ui/PremiumListItem';
import { PremiumSection } from '@/components/ui/PremiumSection';

type ProfileInsightsSectionProps = {
  onOpenAnalytics: () => void;
};

/** Profile shortcut into the analytics dashboard. */
export function ProfileInsightsSection({ onOpenAnalytics }: ProfileInsightsSectionProps) {
  return (
    <PremiumSection label="Insights">
      <PremiumListItem
        title="Health analytics"
        subtitle="Wellness trends, cycle patterns, and symptom insights"
        leftIcon="stats-chart-outline"
        onPress={onOpenAnalytics}
      />
    </PremiumSection>
  );
}
