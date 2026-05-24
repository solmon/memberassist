import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Surface, Card, Banner, ProgressBar, useTheme } from 'react-native-paper';
import { useTenantConfig } from '../../src/hooks/useTenantConfig';
import { useAuth } from '../../src/hooks/useAuth';
import { usePlanOverview } from '../../src/hooks/usePlanOverview';
import { PlanTierChip } from '../../src/components/PlanTierChip';
import { AppTheme } from '../../src/theme/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const { tenant } = useTenantConfig();
  const { enrollment, deductiblePercent, isRenewalPending, planTierLabel, isLoading } = usePlanOverview();
  const theme = useTheme<AppTheme>();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Banner
        visible={isRenewalPending}
        actions={[{ label: 'View', onPress: () => {} }]}
      >
        Your plan is expiring soon. Please renew to avoid a coverage gap.
      </Banner>
      <Surface style={[styles.hero, { backgroundColor: tenant?.brandingColor ?? theme.colors.primary }]} elevation={0}>
        <Text variant="headlineSmall" style={styles.heroText}>
          {tenant?.displayName ?? 'Thrive Portal'}
        </Text>
        <Text variant="bodyLarge" style={styles.heroText}>
          Welcome, {user?.firstName ?? 'Member'}
        </Text>
      </Surface>

      <Card style={styles.card}>
        <Card.Title
          title="My Plan"
          right={() => <PlanTierChip tier={planTierLabel} />}
        />
        <Card.Content>
          {isLoading ? (
            <Text variant="bodyMedium">Loading...</Text>
          ) : enrollment ? (
            <>
              <Text variant="bodyMedium">Monthly Premium: ${enrollment.monthlyPremium}</Text>
              <Text variant="bodySmall" style={styles.label}>Deductible</Text>
              <ProgressBar progress={deductiblePercent / 100} color={theme.colors.primary} />
              <Text variant="bodySmall">${enrollment.deductibleMet} / ${enrollment.deductibleLimit}</Text>
              <Text variant="bodySmall">
                Coverage: {new Date(enrollment.effectiveDate).toLocaleDateString()} – {new Date(enrollment.expiryDate).toLocaleDateString()}
              </Text>
            </>
          ) : (
            <Text variant="bodyMedium">No active enrollment.</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Upcoming Events" subtitle="Stay connected" />
        <Card.Content>
          <Text variant="bodyMedium">No upcoming events.</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Messages" subtitle="Your inbox" />
        <Card.Content>
          <Text variant="bodyMedium">No new messages.</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 24, marginBottom: 16 },
  heroText: { color: '#fff' },
  card: { marginHorizontal: 16, marginBottom: 12 },
  label: { marginTop: 8, marginBottom: 4 },
});
