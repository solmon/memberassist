import { useCallback, useEffect, useState } from 'react';
import { dependentsApi } from '../api/dependentsApi';
import { Dependant } from '../types/dependant';

export function computeAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
}

export function useDependants() {
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDependants = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    dependentsApi
      .getDependants()
      .then((data) => {
        if (!cancelled) {
          setDependants(data);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancel = fetchDependants();
    return cancel;
  }, [fetchDependants]);

  return { dependants, isLoading, error, refetch: fetchDependants };
}
