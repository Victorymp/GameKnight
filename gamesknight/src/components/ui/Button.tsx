import * as React from "react";
import { cn } from "../../lib/utils";

type Variant =
  | "accent"
  | "sky"
  | "surface"
  | "outline"
  | "ghost"
  | "success"
  | "danger";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

/* Fill + text per variant. Every solid variant carries the same
   ink outline so they read as one family. */
const VARIANTS: Record<Variant, string> = {
  accent:
    "bg-accent text-cloud border-ink hover:bg-accent-hover",
  sky:
    "bg-primary text-ink border-ink hover:bg-primary-hover",
  surface:
    "bg-surface text-ink border-ink hover:bg-primary-light",
  outline:
    "bg-surface text-ink border-ink hover:bg-primary-light",
  ghost:
    "bg-transparent text-ink border-ink shadow-none hover:bg-primary-light active:translate-y-0",
  success:
    "bg-success text-cloud border-ink hover:brightness-90",
  danger:
    "bg-error text-cloud border-ink hover:brightness-90",
};

/* Border width scales with size or the outline stops reading
   as a sprite edge on the larger buttons. */
const SIZES: Record<Size, string> = {
  sm: "text-pixel-xs px-4 py-2 border-2",
  md: "text-pixel-sm px-6 py-3 border-4",
  lg: "text-pixel-base px-8 py-4 border-4",
  // Square. Icons need equal padding or the sprite edge looks lopsided.
  "icon-sm": "h-7 w-7 p-0 border-2",
  icon: "h-9 w-9 p-0 border-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "accent",
      size = "md",
      fullWidth = false,
      type = "button",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          // structure
          "inline-flex items-center justify-center gap-2",
          "font-pixel uppercase rounded-none select-none",
          "border-solid shadow-pixel",

          // press: two frames, no easing curve
          "transition-[transform,box-shadow,background-color] duration-75 ease-pixel",
          "hover:-translate-y-0.5",
          "active:translate-y-0.75 active:shadow-pixel-pressed",

          // focus: offset outline, never a soft ring
          "focus-visible:outline-none focus-visible:ring-0",
          "focus-visible:shadow-[0_4px_0_var(--color-ink),0_0_0_3px_var(--color-accent)]",

          // disabled: flatten it — a pressed-looking button that
          // does nothing is worse than an obviously dead one
          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:translate-y-0 disabled:shadow-pixel-sm disabled:hover:translate-y-0",

          VARIANTS[variant],
          SIZES[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
