"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This ensures Supabase picks up the recovery session from the URL
    supabase.auth.getSession();
  }, [supabase]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Success → send to login or account
    router.push("/login");
  }

  return (
    <main className="max-w-md mx-auto mt-20 p-6 border rounded bg-white">
      <h1 className="text-2xl font-bold mb-4">Reset your password</h1>

      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="password"
          required
          placeholder="New password"
          className="w-full border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          required
          placeholder="Confirm new password"
          className="w-full border p-3"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Reset password"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
      )}
    </main>
  );
}
