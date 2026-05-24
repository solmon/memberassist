import { useEffect, useState } from 'react';
import { apiClient } from '../api/apiClient';
import { useTenantStore } from '../store/tenantStore';

export function useTenantConfig() {
  const { tenant, setTenant } = useTenantStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get('/members/tenant-config');
        if (!cancelled) {
          setTenant({
            slug: data.slug,
            displayName: data.name,
            brandingColor: data.brandingColor,
            features: data.features ?? [],
          });
        }
      } catch {
        // use defaults
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [setTenant]);

  return { tenant, isLoading };
}
