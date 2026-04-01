'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import CartDrawer from './CartDrawer';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } });

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuth(s => s.hydrate);
  const hydrateCart = useCart(s => s.openCart); // trigger hydration
  useEffect(() => {
    hydrate();
    useCart.persist.rehydrate();
  }, [hydrate]);
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
