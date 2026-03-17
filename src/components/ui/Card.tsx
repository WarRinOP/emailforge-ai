"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  hover = false,
  style,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "14px",
        padding: "20px",
        transition: hover ? "border-color 0.2s ease, box-shadow 0.2s ease" : undefined,
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--color-border-hover)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 0 0 1px rgba(167,139,250,0.07)";
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--color-border-default)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }
      }}
      className={className}
    >
      {children}
    </div>
  );
}
