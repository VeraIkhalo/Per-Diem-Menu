"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { formatMoney } from "@/lib/format-money";
import type { MenuItemDetail, MenuItemSummary, MoneyDisplay } from "@/lib/types";

export interface CartLine {
  lineId: string;
  itemId: string;
  name: string;
  variationName: string;
  price: MoneyDisplay;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  locationId: string | null;
  setLocationId: (locationId: string) => void;
  addItem: (item: MenuItemSummary | MenuItemDetail) => void;
  removeLine: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalCents: number;
  subtotalFormatted: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function toLine(item: MenuItemSummary | MenuItemDetail): CartLine {
  return {
    lineId: item.id,
    itemId: item.id,
    name: item.name,
    variationName: "variationName" in item ? item.variationName : "Regular",
    price: item.price,
    quantity: 1,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [locationId, setLocationIdState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const setLocationId = useCallback((nextLocationId: string) => {
    setLocationIdState((prev) => {
      if (prev && prev !== nextLocationId) {
        setLines([]);
        setIsOpen(false);
      }
      return nextLocationId;
    });
  }, []);

  const addItem = useCallback((item: MenuItemSummary | MenuItemDetail) => {
    if (!item.isCurrentlyAvailable) return;

    setLines((prev) => {
      const existing = prev.find((l) => l.lineId === item.id);
      if (existing) {
        return prev.map((l) =>
          l.lineId === item.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, toLine(item)];
    });
    setIsOpen(true);
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.lineId !== lineId));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const subtotalCents = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.price.amountCents * line.quantity,
        0,
      ),
    [lines],
  );

  const currency = lines[0]?.price.currency ?? "USD";
  const subtotalFormatted = formatMoney(subtotalCents, currency).formatted;

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      locationId,
      setLocationId,
      addItem,
      removeLine,
      setQuantity,
      clearCart,
      itemCount,
      subtotalCents,
      subtotalFormatted,
      isOpen,
      setIsOpen,
    }),
    [
      lines,
      locationId,
      setLocationId,
      addItem,
      removeLine,
      setQuantity,
      clearCart,
      itemCount,
      subtotalCents,
      subtotalFormatted,
      isOpen,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
