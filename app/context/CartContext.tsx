"use client";

import { createContext, useContext, useState, useEffect } from "react";

/* ==========================================================
   CART ITEM TYPE — supports TILE + INSTALLATION products
   ========================================================== */

export type CartItem = {
  id: string;

  product_id: string;
  title: string;
  image: string;

  productType: "tile" | "installation";

  /* TILE PRODUCT FIELDS */
  finish?: string;
  price_per_m2?: number;
  m2?: number;
  coverage?: number; // m² per box
  boxWeight?: number; // kg per box

  /* INSTALLATION PRODUCT FIELDS */
  price_each?: number; // fixed price
  quantity: number; // used for BOTH tiles (packs) + installation items
};

/* ==========================================================
   CONTEXT TYPE
   ========================================================== */

export type CartContextType = {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  updateItem: (id: string, changes: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;

  total: number;
  totalWeight: number;
};

/* ==========================================================
   CREATE CONTEXT
   ========================================================== */

const CartContext = createContext<CartContextType | null>(null);

/* ==========================================================
   PROVIDER
   ========================================================== */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  /* LOAD LOCAL STORAGE */
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  /* SAVE LOCAL STORAGE */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /* ADD ITEM */
  function addItem(item: Omit<CartItem, "id">) {
    const id = crypto.randomUUID();
    setCart((prev) => [...prev, { ...item, id }]);
  }

  /* UPDATE ITEM */
  function updateItem(id: string, changes: Partial<CartItem>) {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  }

  /* REMOVE ITEM */
  function removeItem(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  /* CLEAR CART */
  function clearCart() {
    setCart([]);
  }

  /* ==========================================================
     TOTAL PRICE
     ========================================================== */
  const total = cart.reduce((sum, item) => {
    if (item.productType === "tile") {
      return sum + (item.price_per_m2 ?? 0) * (item.m2 ?? 0);
    } else {
      return sum + (item.price_each ?? 0) * item.quantity;
    }
  }, 0);

  /* ==========================================================
     TOTAL WEIGHT
     Tiles use boxes → installation uses unit weight directly
     ========================================================== */
  const totalWeight = cart.reduce((sum, item) => {
    if (item.productType === "tile") {
      const boxes = Math.ceil((item.m2 ?? 0) / (item.coverage ?? 1));
      return sum + boxes * (item.boxWeight ?? 0);
    } else {
      return sum + (item.boxWeight ?? 0) * item.quantity;
    }
  }, 0);

  /* ==========================================================
     PROVIDER RETURN
     ========================================================== */
  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        total,
        totalWeight,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ==========================================================
   HOOK
   ========================================================== */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
