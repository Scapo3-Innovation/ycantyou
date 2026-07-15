import { format } from 'date-fns';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { PartnerForecastCards } from '@/features/partner/components/PartnerForecastCards';
import { PartnerHero, PartnerSupportCard } from '@/features/partner/components/PartnerHero';
import {
  buildPartnerSupportTips,
  formatCycleStateLabel,
} from '@/features/partner/insights/supportTips';
import { usePartnerDashboard } from '@/features/partner/usePartnerDashboard';
import { FertileWindowNote } from '@/features/tracking/components/FertileWindowNote';
import { colors, spacing, typography } from '@/theme';

export default function PartnerHomeScreen() {
  const { data: dashboard, isLoading, error } = usePartnerDashboard();
  const today = format(new Date(), 'yyyy-MM-dd');

  if (isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.secondary} />
      </Screen>
    );
  }

  if (error || !dashboard) {
    return (
      <Screen style={styles.centered}>
        <Text style={[typography.body, { color: colors.danger }]}>
          Could not load shared insights.
        </Text>
      </Screen>
    );
  }

  if (dashboard.status === 'none') {
    return (
      <Screen style={styles.centered}>
        <Text style={[typography.h2, { color: colors.text }]}>Not connected</Text>
        <Text style={[typography.body, styles.mutedCenter, { color: colors.textMuted }]}>
          Ask her to share a new invite code if you need to reconnect.
        </Text>
      </Screen>
    );
  }

  if (dashboard.status === 'paused') {
    return (
      <Screen style={styles.centered}>
        <Text style={[typography.h2, { color: colors.text }]}>Sharing paused</Text>
        <Text style={[typography.body, styles.mutedCenter, { color: colors.textMuted }]}>
          {dashboard.primary_name} has paused sharing. Check in with her directly.
        </Text>
      </Screen>
    );
  }

  const tips = buildPartnerSupportTips(dashboard);
  const cycleLabel = formatCycleStateLabel(dashboard.cycle_state);
  const showFertileNote =
    dashboard.prediction?.status === 'regular' && dashboard.prediction.fertile !== null;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.scroll, screenBodyPadding]}
        showsVerticalScrollIndicator={false}>
        <PartnerHero primaryName={dashboard.primary_name} cycleLabel={cycleLabel} />

        {tips.map((tip) => (
          <PartnerSupportCard key={tip.id} tip={tip} />
        ))}

        {dashboard.wellness_today ? (
          <Card>
            <Text style={[typography.captionMedium, { color: colors.textMuted }]}>TODAY</Text>
            <Text style={[typography.body, { color: colors.text }]}>
              {[dashboard.wellness_today.mood, dashboard.wellness_today.energy]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </Card>
        ) : null}

        {dashboard.symptoms_today && dashboard.symptoms_today.length > 0 ? (
          <Card>
            <Text style={[typography.captionMedium, { color: colors.textMuted }]}>SYMPTOMS</Text>
            <Text style={[typography.body, { color: colors.text }]}>
              {dashboard.symptoms_today.join(', ')}
            </Text>
          </Card>
        ) : null}

        {dashboard.prediction ? (
          <PartnerForecastCards prediction={dashboard.prediction} />
        ) : null}

        {showFertileNote ? <FertileWindowNote /> : null}

        <Text style={[typography.caption, styles.footer, { color: colors.textFaint }]}>
          Shared by {dashboard.primary_name} · {today}. Estimates are not medical advice or
          contraception.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  mutedCenter: {
    textAlign: 'center',
  },
  scroll: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  footer: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
