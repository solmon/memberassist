import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  ActivityIndicator,
  Banner,
  Button,
  Card,
  Chip,
  ProgressBar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useTenantConfig } from '../../src/hooks/useTenantConfig';
import { useAuth } from '../../src/hooks/useAuth';
import { usePlanOverview } from '../../src/hooks/usePlanOverview';
import { AppTheme } from '../../src/theme/theme';

function formatDate(date: string | null): string {
  if (!date) {
    return 'N/A';
  }

  return new Date(date).toLocaleDateString();
}

function formatCurrency(value: number | null): string {
  if (value === null) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function statusChipColors(status: string, theme: AppTheme): { backgroundColor: string; textColor: string } {
  if (status === 'ACTIVE') {
    return {
      backgroundColor: theme.colors.secondaryContainer,
      textColor: theme.colors.onSecondaryContainer,
    };
  }

  if (status === 'PENDING') {
    return {
      backgroundColor: theme.colors.tertiaryContainer,
      textColor: theme.colors.onTertiaryContainer,
    };
  }

  return {
    backgroundColor: theme.colors.errorContainer,
    textColor: theme.colors.onErrorContainer,
  };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { tenant } = useTenantConfig();
  const { planSummaries, isRenewalPending, isLoading, error, refetch } = usePlanOverview();
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

      {isLoading && <ActivityIndicator style={styles.stateSpacing} />}

      {error && (
        <Surface style={[styles.card, styles.errorSurface]} elevation={1}>
          <Text variant="bodyMedium">Unable to load plan summary.</Text>
          <Button mode="contained-tonal" onPress={refetch} style={styles.retryButton}>
            Retry
          </Button>
        </Surface>
      )}

      {!isLoading && !error && planSummaries.length === 0 && (
        <Surface style={[styles.card, styles.emptySurface]} elevation={1}>
          <Text variant="bodyMedium">No active coverage</Text>
        </Surface>
      )}

      {!isLoading && !error &&
        planSummaries.map((plan) => {
          const chip = statusChipColors(plan.status, theme);
          return (
            <Card style={styles.card} key={plan.id}>
              <Card.Title
                title={plan.planName}
                subtitle={`${plan.firstName} ${plan.lastName} • ${plan.memberIdNumber}`}
                right={() => (
                  <Chip style={{ backgroundColor: chip.backgroundColor }} textStyle={{ color: chip.textColor }}>
                    {plan.status}
                  </Chip>
                )}
              />
              <Card.Content>
                <Text variant="bodyMedium">Plan Type: {plan.planType}</Text>
                <Text variant="bodyMedium">Tier: {plan.planTier}</Text>
                <Text variant="bodyMedium">Group: {plan.groupNumber}</Text>
                <Text variant="bodyMedium">Monthly Premium: {formatCurrency(plan.monthlyPremium)}</Text>
                <Text variant="bodySmall" style={styles.coverageText}>
                  Effective: {formatDate(plan.effectiveDate)}
                </Text>
                <Text variant="bodySmall">
                  {plan.nextRenewalDate ? 'Next Renewal' : 'Termination'}: {formatDate(plan.nextRenewalDate ?? plan.terminationDate)}
                </Text>

                {plan.showDeductible && (
                  <>
                    <Text variant="bodySmall" style={styles.label}>Deductible</Text>
                    <ProgressBar progress={plan.deductibleProgress} color={theme.colors.primary} />
                    <Text variant="bodySmall">
                      {formatCurrency(plan.deductibleMet)} met of {formatCurrency(plan.deductibleLimit)}
                    </Text>
                  </>
                )}
              </Card.Content>
            </Card>
          );
        })}

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
  heroText: { color: 'white' },
  card: { marginHorizontal: 16, marginBottom: 12 },
  label: { marginTop: 8, marginBottom: 4 },
  coverageText: { marginTop: 8 },
  stateSpacing: { marginBottom: 12 },
  emptySurface: { padding: 16 },
  errorSurface: { padding: 16 },
  retryButton: { marginTop: 12, alignSelf: 'flex-start' },
});
