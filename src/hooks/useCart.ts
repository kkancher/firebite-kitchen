"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MenuItem } from "@/data/menu";

const CART_KEY = "firebite-cart-v1";
const CART_EVENT = "firebite-cart-updated";

export type CartItem = {
  item: MenuItem;
  qty: number;
};

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readCart());

  useEffect(() => {
    const sync = () => setItems(readCart());
    window.addEventListener("storage", sync);
    window.addEventListener(CART_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CART_EVENT, sync);
    };
  }, []);

  const addItem = useCallback((menuItem: MenuItem) => {
    const next = (() => {
      const current = readCart();
      const existing = current.find((entry) => entry.item.id === menuItem.id);
      if (existing) {
        return current.map((entry) =>
          entry.item.id === menuItem.id ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [...current, { item: menuItem, qty: 1 }];
    })();

    writeCart(next);
    setItems(next);
  }, []);

  const setQty = useCallback((itemId: number, qty: number) => {
    const current = readCart();
    const next =
      qty <= 0
        ? current.filter((entry) => entry.item.id !== itemId)
        : current.map((entry) =>
            entry.item.id === itemId ? { ...entry, qty } : entry
          );

    writeCart(next);
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    writeCart([]);
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, entry) => sum + entry.qty, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, entry) => sum + entry.item.price * entry.qty, 0),
    [items]
  );

  return {
    items,
    addItem,
    setQty,
    clear,
    totalItems,
    totalAmount,
  };
}
