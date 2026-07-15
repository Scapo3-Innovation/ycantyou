import { PremiumListItem } from '@/components/ui/PremiumListItem';
import { PremiumSection } from '@/components/ui/PremiumSection';

type ProfileToolsSectionProps = {
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
};

/** Navigable profile shortcuts — analytics, settings, feedback, and privacy. */
export function ProfileToolsSection({
  onOpenAnalytics,
  onOpenSettings,
  onOpenFeedback,
}: ProfileToolsSectionProps) {
  return (
    <PremiumSection label="Tools">
      <PremiumListItem
        title="Health analytics"
        subtitle="Wellness trends, cycle patterns, and symptom insights"
        leftIcon="stats-chart-outline"
        onPress={onOpenAnalytics}
      />
      <PremiumListItem
        title="Send feedback"
        subtitle="Report a bug, suggest a feature, or share thoughts"
        leftIcon="chatbubble-ellipses-outline"
        onPress={onOpenFeedback}
      />
      <PremiumListItem
        title="Settings & privacy"
        subtitle="Notifications, export, and legal"
        leftIcon="shield-checkmark-outline"
        onPress={onOpenSettings}
      />
    </PremiumSection>
  );
}
