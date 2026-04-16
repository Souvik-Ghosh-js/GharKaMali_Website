'use client';
import { create } from 'zustand';

interface User { id:number; name:string; phone:string; email?:string; role:string; wallet_balance?:number; profile_image?:string; referral_code?:string; address?:string; }

interface AuthState {
  user: User | null; token: string | null; isAuthenticated: boolean; isLoading: boolean;
  login: (user: User, token: string) => void;
  updateUser: (u: Partial<User>) => void;
  logout: () => void; hydrate: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null, token: null, isAuthenticated: false, isLoading: true,
  login: (user, token) => {
    if (typeof window !== 'undefined') { localStorage.setItem('gkm_token', token); localStorage.setItem('gkm_user', JSON.stringify(user)); }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },
  updateUser: (u) => set((s) => { const updated = { ...s.user!, ...u }; if (typeof window !== 'undefined') localStorage.setItem('gkm_user', JSON.stringify(updated)); return { user: updated }; }),
  logout: () => {
    if (typeof window !== 'undefined') { localStorage.removeItem('gkm_token'); localStorage.removeItem('gkm_user'); }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    if (typeof window !== 'undefined') window.location.href = '/login';
  },
  hydrate: () => {
    if (typeof window === 'undefined') { set({ isLoading: false }); return; }
    const token = localStorage.getItem('gkm_token');
    const raw = localStorage.getItem('gkm_user');
    if (token && raw) { try { set({ token, user: JSON.parse(raw), isAuthenticated: true, isLoading: false }); } catch { set({ isLoading: false }); } }
    else { set({ isLoading: false }); }
  },
}));
