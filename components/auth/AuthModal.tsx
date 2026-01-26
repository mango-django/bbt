"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "forgot";

export default function AuthModal({
  isOpen,
  onClose,
  redirectTo = "/",
}: {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}) {
  const supabase = supabaseBrowser();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* -------------------------------------------------
     CLOSE MODAL WHEN AUTH COMPLETES
  ------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          onClose();
          window.location.href = redirectTo;
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [isOpen, onClose, redirectTo, supabase]);

  if (!isOpen) return null;

  /* -------------------------------------------------
     HANDLERS
  ------------------------------------------------- */
  async function handleLogin() {
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Redirect handled by auth listener
    setLoading(false);
  }

  async function handleSignup() {
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Account created. You can now sign in.");
      setMode("login");
    }

    setLoading(false);
  }

  async function handleForgot() {
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset email sent.");
    }

    setLoading(false);
  }

  /* -------------------------------------------------
     UI
  ------------------------------------------------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded shadow p-6 space-y-4 relative text-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center">
          {mode === "login" && "Sign in"}
          {mode === "signup" && "Create account"}
          {mode === "forgot" && "Reset password"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {mode !== "forgot" && (
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        {mode === "login" && (
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            Log in
          </button>
        )}

        {mode === "signup" && (
          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            Create account
          </button>
        )}

        {mode === "forgot" && (
          <button
            type="button"
            onClick={handleForgot}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            Send reset link
          </button>
        )}

        <div className="text-sm text-center space-y-1">
          {mode === "login" && (
            <>
              <div>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="underline"
                >
                  Create account
                </button>
              </div>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="underline"
              >
                Forgot password?
              </button>
            </>
          )}

          {mode !== "login" && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="underline"
            >
              Back to sign in
            </button>
          )}
        </div>

        <div className="pt-4 border-t text-center text-sm text-gray-500">
          Google login coming soon
        </div>
      </div>
    </div>
  );
}
