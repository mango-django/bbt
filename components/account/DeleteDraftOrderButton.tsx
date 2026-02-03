"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";

export default function DeleteDraftOrderButton({
  orderId,
  deleteAction,
  onDeleted,
}: {
  orderId: string;
  deleteAction: (orderId: string) => Promise<void>;
  onDeleted?: (orderId: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this draft order?")) return;

    startTransition(async () => {
      try {
        await deleteAction(orderId);
        onDeleted?.(orderId);
        toast.success("Draft order deleted.");
        router.refresh();
      } catch (error) {
        console.error("Failed to delete draft order:", error);
        toast.error("Could not delete this draft order. Please try again.");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="underline text-red-700 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
