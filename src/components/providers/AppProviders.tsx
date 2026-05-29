"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { CartPanel } from "@/components/CartPanel";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartPanel />
    </CartProvider>
  );
}
