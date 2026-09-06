"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  startTransition,
} from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { tileBoxes, tileLinePrice } from "@/lib/pricing";

/* ==========================================================
   CART ITEM TYPE — TILE + INSTALLATION + WOOD PLANK
   ========================================================== */

export type CartItem = {
  id: string;

  product_id: string;
  title: string;
  image: string;

  productType: "tile" | "installation" | "wood_plank" | "bundle";

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
     INSTALLATION + BUNDLE FIELDS
  -------------------------- */
  price_each?: number;
  contents?: string[]; // bundle only — what's inside the package

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

type ProductWeightRow = {
  id: string;
  box_weight_kg: number | null;
  box_coverage_m2: number | null;
};

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
     REFRESH TILE WEIGHTS FROM DB
     Saved carts carry the box weight from when the item was
     added — refresh so delivery is always priced on current
     product data.
  ---------------------------------------------------------- */
  useEffect(() => {
    const tileIds = Array.from(
      new Set(
        cart
          .filter((item) => item.productType === "tile" && !item.boxWeight)
          .map((item) => item.product_id)
      )
    );
    if (tileIds.length === 0) return;

    let cancelled = false;

    supabaseBrowser()
      .from("products")
      .select("id, box_weight_kg, box_coverage_m2")
      .in("id", tileIds)
      .then(({ data }: { data: ProductWeightRow[] | null }) => {
        if (cancelled || !data?.length) return;
        const byId = new Map(data.map((p) => [p.id, p]));
        setCart((prev) =>
          prev.map((item) => {
            const fresh =
              item.productType === "tile" ? byId.get(item.product_id) : null;
            if (!fresh) return item;
            return {
              ...item,
              boxWeight: Number(fresh.box_weight_kg) || item.boxWeight,
              coverage: Number(fresh.box_coverage_m2) || item.coverage,
            };
          })
        );
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

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
          return sum + tileLinePrice(item);

        case "wood_plank":
          return sum + (item.price_per_box ?? 0) * (item.boxes ?? 0);

        case "installation":
        case "bundle":
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
          const boxes = tileBoxes(item.m2, item.coverage);
          return sum + boxes * (item.boxWeight ?? 0);
        }

        case "wood_plank":
          return sum + (item.boxes ?? 0) * (item.boxWeight ?? 0);

        case "installation":
        // Bundles carry the whole package weight in boxWeight.
        case "bundle":
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
