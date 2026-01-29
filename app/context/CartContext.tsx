"use client";

import { createContext, useContext, useState, useEffect } from "react";

/* ==========================================================
   CART ITEM TYPE — TILE + INSTALLATION + WOOD PLANK
   ========================================================== */

export type CartItem = {
  id: string;

  product_id: string;
  title: string;
  image: string;

  productType: "tile" | "installation" | "wood_plank";

  /* --------------------------
     TILE PRODUCT FIELDS
  -------------------------- */
  finish?: string;
  price_per_m2?: number;
  m2?: number;
  coverage?: number; // m² per box
  boxWeight?: number; // kg per box

  /* --------------------------
     WOOD PLANK FIELDS
  -------------------------- */
  price_per_box?: number;
  boxes?: number;

  /* --------------------------
     INSTALLATION FIELDS
  -------------------------- */
  price_each?: number;

  /* --------------------------
     SHARED
  -------------------------- */
  quantity: number;
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

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cart:add", {
          detail: { title: item.title },
        })
      );
    }
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
    switch (item.productType) {
      case "tile":
        return sum + (item.price_per_m2 ?? 0) * (item.m2 ?? 0);

      case "wood_plank":
        return sum + (item.price_per_box ?? 0) * (item.boxes ?? 0);

      case "installation":
        return sum + (item.price_each ?? 0) * item.quantity;

      default:
        return sum;
    }
  }, 0);

  /* ==========================================================
     TOTAL WEIGHT
     ========================================================== */
  const totalWeight = cart.reduce((sum, item) => {
    switch (item.productType) {
      case "tile": {
        const boxes = Math.ceil((item.m2 ?? 0) / (item.coverage ?? 1));
        return sum + boxes * (item.boxWeight ?? 0);
      }

      case "wood_plank":
        return sum + (item.boxes ?? 0) * (item.boxWeight ?? 0);

      case "installation":
        return sum + (item.boxWeight ?? 0) * item.quantity;

      default:
        return sum;
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
