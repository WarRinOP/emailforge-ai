"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

export default function CopyButton({
  text,
  label,
  size = "sm",
  style,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  const isSmall = size === "sm";

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: copied
          ? "rgba(34,197,94,0.12)"
          : "rgba(167,139,250,0.08)",
        color: copied ? "#22c55e" : "#a78bfa",
        border: `1px solid ${copied ? "rgba(34,197,94,0.25)" : "rgba(167,139,250,0.2)"}`,
        borderRadius: "7px",
        padding: isSmall ? "4px 9px" : "6px 12px",
        cursor: "pointer",
        fontSize: isSmall ? "11px" : "12px",
        fontWeight: 500,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
        flexShrink: 0,
        ...style,
      }}
    >
      {copied ? (
        <>
          <svg width={isSmall ? 11 : 13} height={isSmall ? 11 : 13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {label ? "Copied!" : "Copied"}
        </>
      ) : (
        <>
          <svg width={isSmall ? 11 : 13} height={isSmall ? 11 : 13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label ?? "Copy"}
        </>
      )}
    </button>
  );
}
