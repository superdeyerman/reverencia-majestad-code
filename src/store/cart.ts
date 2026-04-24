import { create } from 'zustand';

export interface CartService {
  id: string;
  slug: string;
  name: string;
  category: string;
  basePrice: number;
  durationMinutes: number;
  supportsHairMetrics: boolean;
  supportsHome: boolean;
  supportsHotel: boolean;
}

interface CartState {
  items: CartService[];
  add: (service: CartService) => void;
  remove: (serviceId: string) => void;
  clear: () => void;
  has: (serviceId: string) => boolean;
}

export const DISCOUNT_LADDER: Record<number, number> = {
  1: 0,
  2: 0.05,
  3: 0.10,
};
const MAX_DISCOUNT = 0.15;

export function cartDiscount(count: number): number {
  if (count <= 1) return 0;
  return DISCOUNT_LADDER[count] ?? MAX_DISCOUNT;
}

export function cartTotal(items: CartService[]): {
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  totalDuration: number;
} {
  const subtotal = items.reduce((s, i) => s + i.basePrice, 0);
  const discountRate = cartDiscount(items.length);
  const discountAmount = Math.round(subtotal * discountRate);
  const total = subtotal - discountAmount;
  const totalDuration = items.reduce((s, i) => s + i.durationMinutes, 0);
  return { subtotal, discountRate, discountAmount, total, totalDuration };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  add: (service) => {
    if (get().has(service.id)) return;
    set((s) => ({ items: [...s.items, service] }));
  },

  remove: (serviceId) => {
    set((s) => ({ items: s.items.filter((i) => i.id !== serviceId) }));
  },

  clear: () => set({ items: [] }),

  has: (serviceId) => get().items.some((i) => i.id === serviceId),
}));
