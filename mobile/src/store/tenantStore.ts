import { create } from 'zustand';

export interface TenantConfig {
  slug: string;
  displayName: string;
  brandingColor: string;
  features: string[];
}

interface TenantState {
  tenant: TenantConfig | null;
  setTenant: (config: TenantConfig) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  setTenant: (config) => set({ tenant: config }),
  clearTenant: () => set({ tenant: null }),
}));
