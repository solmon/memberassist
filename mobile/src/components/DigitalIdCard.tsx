import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { PlanTierChip } from './PlanTierChip';
import { AppTheme } from '../theme/theme';

interface DigitalIdCardProps {
  memberName: string;
  memberId: string;
  groupNumber: string;
  planTier: string;
  effectiveDate: string;
}

export function DigitalIdCard({ memberName, memberId, groupNumber, planTier, effectiveDate }: DigitalIdCardProps) {
  const theme = useTheme<AppTheme>();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
      <Card.Content>
        <View style={styles.row}>
          <Text variant="labelSmall" style={styles.label}>MEMBER</Text>
          <PlanTierChip tier={planTier} />
        </View>
        <Text variant="titleMedium" style={styles.name}>{memberName}</Text>
        <View style={styles.row}>
          <View>
            <Text variant="labelSmall" style={styles.label}>MEMBER ID</Text>
            <Text variant="bodyMedium">{memberId}</Text>
          </View>
          <View>
            <Text variant="labelSmall" style={styles.label}>GROUP</Text>
            <Text variant="bodyMedium">{groupNumber}</Text>
          </View>
        </View>
        <Text variant="labelSmall" style={styles.label}>EFFECTIVE DATE</Text>
        <Text variant="bodySmall">{new Date(effectiveDate).toLocaleDateString()}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { opacity: 0.6, marginBottom: 2 },
  name: { marginBottom: 12 },
});
