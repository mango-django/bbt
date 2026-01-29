"use client";

type Props = {
  plankId: string;
};

export default function DeleteWoodPlankButton({ plankId }: Props) {
  async function handleDelete() {
    if (!plankId) {
      alert("Invalid wood plank ID.");
      return;
    }

    const ok = confirm("Delete this wood plank? This cannot be undone.");
    if (!ok) return;

    const res = await fetch(`/api/admin/wood-planks/${plankId}/delete`, {
      method: "POST",
    });

    const json = await res.json();

    if (!res.ok || !json?.success) {
      alert(json?.error || "Failed to delete wood plank.");
      return;
    }

    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600"
    >
      Delete
    </button>
  );
}
