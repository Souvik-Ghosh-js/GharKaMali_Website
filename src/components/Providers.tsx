'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import CartDrawer from './CartDrawer';

import { useLocation } from '@/store/location';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } });

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuth(s => s.hydrate);
  const detectLoc = useLocation(s => s.detectLocation);
  
  useEffect(() => {
    hydrate();
    useCart.persist.rehydrate();
    detectLoc();
  }, [hydrate, detectLoc]);
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => qc);
  return (
    <QueryClientProvider client={client}>
      <AuthHydrator>
        {children}
        <CartDrawer />
      </AuthHydrator>
    </QueryClientProvider>
  );
}
