'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  mrp: number;
  qty: number;
  category: string;
  icon: string; // SVG path data or identifier
  type?: 'product' | 'service';
  bookingDetails?: {
    plan_id?: number;
    plan_type?: string;
    zone_id?: number;
    scheduled_date?: string;
    scheduled_time?: string;
    service_address?: string;
    service_latitude?: number;
    service_longitude?: number;
    plant_count?: number;
    addons?: { addon_id: number; quantity: number }[];
    notes?: string;
    price?: number;
    auto_renew?: boolean;
    preferred_gardener_id?: number;
  };
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  wantsMali: boolean;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  addService: (service: Omit<CartItem, 'qty' | 'type'> & { bookingDetails: CartItem['bookingDetails'] }) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setWantsMali: (v: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      wantsMali: false,

      addItem: (item) => {
        set(state => {
          const existing = state.items.find(i => i.id === item.id && (!i.type || i.type === 'product'));
          if (existing) {
            return { items: state.items.map(i => (i.id === item.id && (!i.type || i.type === 'product')) ? { ...i, qty: i.qty + 1 } : i) };
          }
          return { items: [...state.items, { ...item, type: 'product', qty: 1 } as CartItem] };
        });
      },

      addService: (service) => {
        set(state => {
          // Check if same service (plan_id + date + time) already exists
          const existing = state.items.find(i => 
            i.type === 'service' && 
            i.bookingDetails?.plan_id === service.bookingDetails?.plan_id &&
            i.bookingDetails?.scheduled_date === service.bookingDetails?.scheduled_date &&
            i.bookingDetails?.scheduled_time === service.bookingDetails?.scheduled_time
          );
          if (existing) {
            toast('This visit is already in your cart', { icon: '🧑‍🌾' });
            return state;
          }
          toast.success('Gardener visit added to cart!');
          return { 
            items: [...state.items, { ...service, type: 'service', qty: 1 } as CartItem],
            isOpen: true 
          };
        });
      },

      removeItem: (id) => set(state => ({ items: state.items.filter((i, idx) => {
        // If it's a product, filter by ID. If it's a service, we might need more specific filtering, 
        // but for now let's assume one service of a type at a time or use a unique key.
        // Actually, let's just use the index or a unique ID for services in the future.
        // For simplicity now, we filter by the object reference or ID.
        return i.id !== id;
      }) })),

      updateQty: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id);
          return;
        }
        set(state => ({ items: state.items.map(i => i.id === id ? { ...i, qty } : i) }));
      },

      clearCart: () => set({ items: [], wantsMali: false }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setWantsMali: (v) => set({ wantsMali: v }),

      totalItems: () => get().items.reduce((s, i) => s + i.qty, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    { name: 'gkm-cart', skipHydration: true }
  )
);
