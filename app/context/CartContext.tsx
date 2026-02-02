"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  startTransition,
} from "react";

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

  /* ----------------------------------------------------------
     LOAD LOCAL STORAGE (ONCE)
  ---------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        localStorage.removeItem("cart");
      }
    }
  }, []);

/* ----------------------------------------------------------
   SAVE LOCAL STORAGE (SAFARI SAFE – DEBOUNCED)
---------------------------------------------------------- */
useEffect(() => {
  if (typeof window === "undefined") return;

  const timeout = setTimeout(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, 300);

  return () => clearTimeout(timeout);
}, [cart]);

  /* ----------------------------------------------------------
     ADD ITEM (TRANSITIONED)
  ---------------------------------------------------------- */
  function addItem(item: Omit<CartItem, "id">) {
    const id = crypto.randomUUID();

    startTransition(() => {
      setCart((prev) => [...prev, { ...item, id }]);
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cart:add", {
          detail: { title: item.title },
        })
      );
    }
  }

  /* ----------------------------------------------------------
     UPDATE ITEM
  ---------------------------------------------------------- */
  function updateItem(id: string, changes: Partial<CartItem>) {
    startTransition(() => {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
      );
    });
  }

  /* ----------------------------------------------------------
     REMOVE ITEM
  ---------------------------------------------------------- */
  function removeItem(id: string) {
    startTransition(() => {
      setCart((prev) => prev.filter((item) => item.id !== id));
    });
  }

  /* ----------------------------------------------------------
     CLEAR CART
  ---------------------------------------------------------- */
  function clearCart() {
    startTransition(() => {
      setCart([]);
    });
  }

  /* ==========================================================
     TOTAL PRICE (MEMOISED)
     ========================================================== */
  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
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
  }, [cart]);

  /* ==========================================================
     TOTAL WEIGHT (MEMOISED)
     ========================================================== */
  const totalWeight = useMemo(() => {
    return cart.reduce((sum, item) => {
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
  }, [cart]);

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
