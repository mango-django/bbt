"use client";

import { useState } from "react";

export default function CopyTrackingButton({
  value,
}: {
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"
      aria-label="Copy tracking number"
    >
      <span>{value}</span>
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="9" y="9" width="10" height="10" rx="2" />
        <rect x="5" y="5" width="10" height="10" rx="2" />
      </svg>
      {copied && <span className="text-green-600">Copied</span>}
    </button>
  );
}
