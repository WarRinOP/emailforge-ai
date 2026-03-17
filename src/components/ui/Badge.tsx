"use client";

import React from "react";

type BadgeVariant =
  | "cold_outreach"
  | "follow_up"
  | "welcome_drip"
  | "re_engagement"
  | "sales_nurture"
  | "professional"
  | "conversational"
  | "direct"
  | "friendly"
  | "accent"
  | "muted"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: "sm" | "md";
}

const variantMap: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  // Sequence types
  cold_outreach:  { bg: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "rgba(167,139,250,0.25)" },
  follow_up:      { bg: "rgba(59,130,246,0.12)",  color: "#3b82f6", border: "rgba(59,130,246,0.25)" },
  welcome_drip:   { bg: "rgba(34,197,94,0.12)",   color: "#22c55e", border: "rgba(34,197,94,0.25)" },
  re_engagement:  { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", border: "rgba(245,158,11,0.25)" },
  sales_nurture:  { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", border: "rgba(239,68,68,0.25)" },
  // Tones
  professional:   { bg: "rgba(167,139,250,0.10)", color: "#a78bfa", border: "rgba(167,139,250,0.2)" },
  conversational: { bg: "rgba(34,197,94,0.10)",   color: "#22c55e", border: "rgba(34,197,94,0.2)" },
  direct:         { bg: "rgba(239,68,68,0.10)",   color: "#ef4444", border: "rgba(239,68,68,0.2)" },
  friendly:       { bg: "rgba(245,158,11,0.10)",  color: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  // Generic
  accent:   { bg: "rgba(167,139,250,0.12)", color: "#a78bfa",  border: "rgba(167,139,250,0.25)" },
  muted:    { bg: "rgba(74,74,106,0.15)",   color: "#4a4a6a",  border: "rgba(74,74,106,0.25)" },
  success:  { bg: "rgba(34,197,94,0.12)",   color: "#22c55e",  border: "rgba(34,197,94,0.25)" },
  warning:  { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b",  border: "rgba(245,158,11,0.25)" },
  danger:   { bg: "rgba(239,68,68,0.12)",   color: "#ef4444",  border: "rgba(239,68,68,0.25)" },
  info:     { bg: "rgba(59,130,246,0.12)",  color: "#3b82f6",  border: "rgba(59,130,246,0.25)" },
};

export default function Badge({
  variant = "accent",
  children,
  size = "sm",
}: BadgeProps) {
  const v = variantMap[variant] ?? variantMap.accent;
  const isSmall = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        borderRadius: "6px",
        fontSize: isSmall ? "11px" : "12px",
        fontWeight: 600,
        padding: isSmall ? "2px 8px" : "3px 10px",
        letterSpacing: "0.04em",
        lineHeight: 1.6,
        whiteSpace: "nowrap",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {children}
    </span>
  );
}
