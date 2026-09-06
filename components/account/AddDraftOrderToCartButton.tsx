"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart, type CartItem } from "@/app/context/CartContext";

type DraftCartItem = Omit<CartItem, "id">;

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDraftItem(raw: unknown): DraftCartItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Record<string, unknown>;
  const productType = item.productType;
  const product_id = String(item.product_id ?? "").trim();
  const title = String(item.title ?? "").trim();
  const image = String(item.image ?? "");
  const quantity = Math.max(1, Math.round(toNumber(item.quantity, 1)));

  if (!product_id || !title) return null;

  if (productType === "tile") {
    return {
      product_id,
      title,
      image,
      productType: "tile",
      finish: typeof item.finish === "string" ? item.finish : undefined,
      price_per_m2: toNumber(item.price_per_m2, 0),
      m2: toNumber(item.m2, 1),
      coverage: toNumber(item.coverage, 1),
      boxWeight: toNumber(item.boxWeight, 0),
      quantity,
    };
  }

  if (productType === "wood_plank") {
    const coverage = toNumber(item.coverage, 1);
    const m2 = toNumber(item.m2, 0);
    const boxes = Math.max(
      1,
      Math.round(toNumber(item.boxes, Math.ceil(m2 / (coverage || 1))))
    );

    return {
      product_id,
      title,
      image,
      productType: "wood_plank",
      price_per_box: toNumber(item.price_per_box, 0),
      boxes,
      m2,
      coverage,
      boxWeight: toNumber(item.boxWeight, 0),
      quantity,
    };
  }

  if (productType === "installation" || productType === "bundle") {
    return {
      product_id,
      title,
      image,
      productType,
      finish: typeof item.finish === "string" ? item.finish : undefined,
      price_each: toNumber(item.price_each, 0),
      quantity,
      boxWeight: toNumber(item.boxWeight, 0),
      m2: toNumber(item.m2, 0),
      coverage: toNumber(item.coverage, 1),
      contents: Array.isArray(item.contents)
        ? item.contents.filter((c): c is string => typeof c === "string")
        : undefined,
    };
  }

  return null;
}

export default function AddDraftOrderToCartButton({ items }: { items: unknown[] }) {
  const router = useRouter();
  const { cart, clearCart, addItem } = useCart();
  const [isPending, startTransition] = useTransition();

  function handleAddToCart() {
    startTransition(() => {
      const parsedItems = items
        .map(normalizeDraftItem)
        .filter((item): item is DraftCartItem => item !== null);

      if (parsedItems.length === 0) {
        toast.error("This draft has no valid items.");
        return;
      }

      if (
        cart.length > 0 &&
        !confirm("Replace your current basket with this draft order?")
      ) {
        return;
      }

      clearCart();
      parsedItems.forEach((item) => addItem(item));
      toast.success("Draft order added to basket.");
      router.push("/cart");
    });
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
      className="px-3 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {isPending ? "Adding..." : "Add to Cart"}
    </button>
  );
}
