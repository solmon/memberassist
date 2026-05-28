import { useCallback, useEffect, useMemo, useState } from 'react';
import { plansApi } from '../api/plansApi';
import { PlanSummary } from '../types/planSummary';

export interface PlanSummaryViewModel extends PlanSummary {
  showDeductible: boolean;
  deductibleProgress: number;
}

export function usePlanOverview() {
  const [planSummaries, setPlanSummaries] = useState<PlanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanSummary = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    plansApi
      .getPlanSummary()
      .then((data) => {
        if (!cancelled) {
          setPlanSummaries(data);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cancel = fetchPlanSummary();
    return cancel;
  }, [fetchPlanSummary]);

  const planSummaryModels = useMemo<PlanSummaryViewModel[]>(
    () =>
      planSummaries.map((plan) => {
        const showDeductible = plan.deductibleLimit !== null && plan.deductibleLimit > 0;
        const deductibleProgress = showDeductible
          ? Math.min(1, Math.max(0, (plan.deductibleMet ?? 0) / plan.deductibleLimit!))
          : 0;

        return {
          ...plan,
          showDeductible,
          deductibleProgress,
        };
      }),
    [planSummaries],
  );

  const isRenewalPending = useMemo(
    () =>
      planSummaries.some((plan) => {
        if (!plan.nextRenewalDate) {
          return false;
        }

        const renewalTs = new Date(plan.nextRenewalDate).getTime();
        const diff = renewalTs - Date.now();
        return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
      }),
    [planSummaries],
  );

  return {
    planSummaries: planSummaryModels,
    isRenewalPending,
    isLoading,
    error,
    refetch: fetchPlanSummary,
  };
}
