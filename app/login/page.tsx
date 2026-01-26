import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white shadow rounded p-6 space-y-4">
            <h1 className="text-xl font-bold text-center">Sign in</h1>
            <p className="text-sm text-gray-500">Loading…</p>
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
