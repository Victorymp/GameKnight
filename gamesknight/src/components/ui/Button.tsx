import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Shared button. Variants map to the app's teal design language:
 *   - primary   : solid teal call-to-action (Confirm, Save, …)
 *   - solid     : dark-teal "active"/selected state (e.g. an engaged toggle)
 *   - outline   : light-bordered neutral action (Add Visit, Merge, …)
 *   - subtle    : grey-bordered secondary (dialog Cancel)
 *   - ghost     : text-only, hover background
 *   - danger    : destructive / error acknowledgement
 *   - warning   : caution acknowledgement
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "solid" | "outline" | "subtle" | "ghost" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
}

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover focus:ring-accent",
  solid: "bg-primary text-white hover:bg-primary-hover focus:ring-primary",
  outline: "border border-border text-text hover:bg-primary-light focus:ring-accent",
  subtle: "border border-border text-text-muted hover:bg-surface focus:ring-border",
  ghost: "text-text-muted hover:bg-primary-light focus:ring-border",
  danger: "bg-error text-white hover:bg-red-700 focus:ring-error",
  warning: "bg-warning text-white hover:bg-amber-700 focus:ring-warning",
};

const SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

    return (
      <button
        ref={ref}
        className={cn(base, VARIANTS[variant], SIZES[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";