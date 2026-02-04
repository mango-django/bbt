"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let active = true;

    // Ensure the recovery session from the reset link is loaded before submit.
    void supabase.auth
      .getSession()
      .then(
        ({
          data,
        }: {
          data: {
            session: Session | null;
          };
        }) => {
          if (!active) return;

          if (!data.session) {
            setError(
              "Reset link is invalid or expired. Please request a new one."
            );
          }

          setReady(true);
        }
      )
      .catch(() => {
        if (!active) return;
        setError(
          "Could not validate reset link. Please request a new one."
        );
        setReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setError(null);
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

async function handleReset(e: React.FormEvent<HTMLFormElement>) {
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

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // ✅ SUCCESS
    setSuccess(true);
  } catch {
    setError("Could not update password. Please try again.");
  } finally {
    setLoading(false);
  }
}


  return (
   
  <main className="max-w-md mx-auto mt-20 p-6 border rounded bg-white">
    {success ? (
      <>
        <h1 className="text-2xl font-bold mb-4">
          Password updated successfully
        </h1>

        <p className="text-gray-600 mb-6">
          Your password has been changed. You can now continue to your account.
        </p>

        <button
          onClick={() => router.push("/account")}
          className="w-full bg-black text-white py-3"
        >
          Continue to account
        </button>
      </>
    ) : (
      <>
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
            disabled={loading || !ready}
            className="w-full bg-black text-white py-3 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset password"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
      </>
    )}
  </main>
);
}
