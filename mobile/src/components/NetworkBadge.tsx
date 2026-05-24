import React from 'react';
import { Chip, useTheme } from 'react-native-paper';

interface NetworkBadgeProps {
  inNetwork: boolean;
}

export function NetworkBadge({ inNetwork }: NetworkBadgeProps) {
  const theme = useTheme();
  return (
    <Chip
      compact
      style={{ backgroundColor: inNetwork ? '#e6f4ea' : '#fce8e6' }}
      textStyle={{ color: inNetwork ? '#137333' : '#c5221f' }}
    >
      {inNetwork ? 'In Network' : 'Out of Network'}
    </Chip>
  );
}
