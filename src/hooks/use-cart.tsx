import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Track } from "@/lib/types";
import { toast } from "sonner";

const STORAGE_KEY = "neoshade_cart";

interface CartContextValue {
  items: Track[];
  count: number;
  totalCents: number;
  add: (track: Track) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Track[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = (track: Track) => {
    setItems((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      toast.success(`Added "${track.title}" to cart`);
      return [...prev, track];
    });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((t) => t.id !== id));
  const clear = () => setItems([]);
  const has = (id: string) => items.some((t) => t.id === id);

  const totalCents = items.reduce((sum, t) => sum + (t.price_cents || 0), 0);

  return (
    <CartContext.Provider
      value={{ items, count: items.length, totalCents, add, remove, clear, has }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
