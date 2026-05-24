import React from 'react';
import { Badge } from 'react-native-paper';

interface UnreadBadgeProps {
  count: number;
}

export function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count === 0) return null;
  return <Badge>{count}</Badge>;
}
