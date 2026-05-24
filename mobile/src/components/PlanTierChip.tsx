import React from 'react';
import { Chip, useTheme } from 'react-native-paper';
import { AppTheme } from '../theme/theme';

type PlanTier = 'GOLD' | 'SILVER' | 'HDHP' | string;

interface PlanTierChipProps {
  tier: PlanTier;
}

export function PlanTierChip({ tier }: PlanTierChipProps) {
  const theme = useTheme<AppTheme>();

  const bgColor =
    tier === 'GOLD' ? theme.colors.primary
    : tier === 'SILVER' ? theme.colors.secondary
    : tier === 'HDHP' ? theme.colors.tertiary
    : theme.colors.surfaceVariant;

  return (
    <Chip
      style={{ backgroundColor: bgColor }}
      textStyle={{ color: '#fff' }}
    >
      {tier}
    </Chip>
  );
}
