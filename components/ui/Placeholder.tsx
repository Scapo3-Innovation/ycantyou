import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

type PlaceholderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof EmptyState>['icon'];
};

/** Empty-state placeholder used by not-yet-built tab screens. */
export function Placeholder({ title, subtitle = 'Coming soon', icon }: PlaceholderProps) {
  return (
    <Screen>
      <EmptyState icon={icon} title={title} message={subtitle} />
    </Screen>
  );
}
