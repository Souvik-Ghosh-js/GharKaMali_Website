'use client';
import { create } from 'zustand';
import { checkServiceability } from '@/lib/api';

interface LocationState {
  zone: any;
  isLoading: boolean;
  hasAttempted: boolean;
  detectLocation: () => Promise<void>;
  setZone: (zone: any) => void;
}

export const useLocation = create<LocationState>((set) => ({
  zone: null,
  isLoading: false,
  hasAttempted: false,
  detectLocation: async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      set({ hasAttempted: true });
      return;
    }
    set({ isLoading: true, hasAttempted: true });
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await checkServiceability(pos.coords.latitude, pos.coords.longitude);
            if (res?.serviceable) {
              set({ zone: res.zone || res.zones?.[0], isLoading: false });
            } else {
              set({ zone: null, isLoading: false });
            }
          } catch {
            set({ zone: null, isLoading: false });
          }
          resolve();
        },
        () => {
          set({ zone: null, isLoading: false });
          resolve();
        },
        { timeout: 10000 }
      );
    });
  },
  setZone: (zone) => set({ zone })
}));
