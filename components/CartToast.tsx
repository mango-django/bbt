"use client";

import { useEffect, useRef, useState } from "react";

type ToastState = {
  message: string;
  visible: boolean;
};

export default function CartToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    visible: false,
  });
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function handleAdd(event: Event) {
      const detail = (event as CustomEvent<{ title?: string }>).detail;
      const title = detail?.title?.trim();
      const message = title ? `${title} added to cart` : "Added to cart";

      setToast({ message, visible: true });

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 2400);
    }

    window.addEventListener("cart:add", handleAdd);
    return () => {
      window.removeEventListener("cart:add", handleAdd);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] transition-opacity duration-200 ${
        toast.visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-live="polite"
    >
      <div className="bg-black text-white text-sm px-4 py-3 rounded-md shadow-lg">
        {toast.message}
      </div>
    </div>
  );
}
