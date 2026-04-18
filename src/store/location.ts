'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { checkServiceability } from '@/lib/api';

interface LocationState {
  zone: any;
  lat: number | null;
  lng: number | null;
  address: string;
  isLoading: boolean;
  hasAttempted: boolean;
  detectLocation: () => Promise<void>;
  setZone: (zone: any) => void;
  setCoords: (lat: number, lng: number, address?: string) => void;
  clear: () => void;
}

export const useLocation = create<LocationState>()(
  persist(
    (set) => ({
      zone: null,
      lat: null,
      lng: null,
      address: '',
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
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              try {
                const res: any = await checkServiceability(lat, lng);
                set({
                  zone: res?.serviceable ? (res.zone || res.zones?.[0]) : null,
                  lat,
                  lng,
                  isLoading: false,
                });
              } catch {
                set({ lat, lng, isLoading: false });
              }
              resolve();
            },
            () => {
              set({ isLoading: false });
              resolve();
            },
            { timeout: 10000 }
          );
        });
      },
      setZone: (zone) => set({ zone }),
      setCoords: (lat, lng, address) =>
        set((s) => ({ lat, lng, address: address ?? s.address })),
      clear: () => set({ zone: null, lat: null, lng: null, address: '' }),
    }),
    { name: 'gkm-location', skipHydration: true }
  )
);
