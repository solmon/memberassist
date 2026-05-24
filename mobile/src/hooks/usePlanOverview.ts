import { useEffect, useState } from 'react';
import { plansApi } from '../api/plansApi';

interface Enrollment {
  id: string;
  planTier: string;
  monthlyPremium: number;
  effectiveDate: string;
  expiryDate: string;
  deductibleMet: number;
  deductibleLimit: number;
  status: string;
}

export function usePlanOverview() {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    plansApi.getEnrollment()
      .then((data: Enrollment) => { if (!cancelled) setEnrollment(data); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const deductiblePercent = enrollment
    ? (enrollment.deductibleMet / enrollment.deductibleLimit) * 100
    : 0;

  const isRenewalPending = enrollment
    ? new Date(enrollment.expiryDate).getTime() - Date.now() < 30 * 24 * 3600 * 1000
    : false;

  const planTierLabel = enrollment?.planTier ?? '';

  return { enrollment, deductiblePercent, isRenewalPending, planTierLabel, isLoading, error };
}
