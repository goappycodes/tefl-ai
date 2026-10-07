"use client";

import { useId } from "react";

/** The four-point sparkle from the TEFL.ai logo — used as a recurring motif. */
export function Sparkle({
  className = "",
  size = 24,
  gradient = true,
}: {
  className?: string;
  size?: number;
  gradient?: boolean;
}) {
  const rawId = useId();
  const id = `spk-${rawId.replace(/[:]/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#3AD0F8" />
            <stop offset="100%" stopColor="#2961F6" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 0c.5 6.2 5.8 11.5 12 12-6.2.5-11.5 5.8-12 12-.5-6.2-5.8-11.5-12-12C6.2 11.5 11.5 6.2 12 0z"
        fill={gradient ? `url(#${id})` : "currentColor"}
      />
    </svg>
  );
}
