'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  mrp: number;
  qty: number;
  category: string;
  icon: string; // SVG path data or identifier
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set(state => {
          const existing = state.items.find(i => i.id === item.id);
          if (existing) {
            return { items: state.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
          }
          return { items: [...state.items, { ...item, qty: 1 }] };
        });
      },

      removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),

      updateQty: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id);
          return;
        }
        set(state => ({ items: state.items.map(i => i.id === id ? { ...i, qty } : i) }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((s, i) => s + i.qty, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    { name: 'gkm-cart', skipHydration: true }
  )
);
