import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { appTheme } from '../src/theme/theme';
import { useAuthStore } from '../src/store/authStore';
import { useTenantStore } from '../src/store/tenantStore';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(app)/home');
    }
  }, [user, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(false);
  const { hydrate } = useAuthStore();
  const tenant = useTenantStore((s) => s.tenant);

  useEffect(() => {
    hydrate().then(() => setHydrated(true)).catch(() => setHydrated(true));
  }, [hydrate]);

  const theme = {
    ...appTheme,
    colors: {
      ...appTheme.colors,
      primary: tenant?.brandingColor ?? appTheme.colors.primary,
    },
  };

  if (!hydrated) return null;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthGuard>
          <Slot />
        </AuthGuard>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
