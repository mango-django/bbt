"use client";

type Props = {
  productId: string;
};

export default function DeleteInstallationProductForm({ productId }: Props) {
  async function handleDelete() {
    console.log("DELETE BUTTON RECEIVED ID:", productId); // DEBUG

    if (!productId || productId === "undefined") {
      alert("Invalid product ID — cannot delete.");
      return;
    }

    const ok = confirm("Delete this product?");
    if (!ok) return;

    const res = await fetch(`/api/admin/installation-products/${productId}`, {
      method: "DELETE",
    });

    const json = await res.json();

    if (!json.success) {
      alert(json.error || "Failed to delete product");
      return;
    }

    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1 bg-red-600 text-white rounded text-xs"
    >
      Delete
    </button>
  );
}
