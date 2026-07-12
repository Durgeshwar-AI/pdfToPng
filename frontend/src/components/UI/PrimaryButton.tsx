import React from "react";
import { twMerge } from "tailwind-merge";

/**
 * Centralized primary call-to-action button used across all conversion tools.
 *
 * Encapsulates the shared design-system styling — blue gradient, hover/active
 * feedback, and a dedicated disabled state — so every tool's primary action
 * looks and behaves identically. Pass `className` to tweak layout (e.g. width
 * or margin) without redefining the base appearance.
 */
const baseClasses =
  "bg-linear-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide relative overflow-hidden w-full max-w-75 mx-auto flex items-center justify-center hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-linear-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none";

type PrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton({
  className,
  type = "button",
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button type={type} className={twMerge(baseClasses, className)} {...props}>
      {children}
    </button>
  );
}
