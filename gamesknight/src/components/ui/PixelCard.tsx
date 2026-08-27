import * as React from "react";
import { cn } from "../../lib/utils";

type Variant = "surface" | "sky" | "accent" | "ghost";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  /** Drops the hard shadow — for cards sitting inside another card. */
  flat?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  surface: "bg-surface text-ink",
  sky: "bg-primary-light text-ink",
  accent: "bg-accent text-cloud",
  ghost: "bg-transparent text-ink",
};

export function Card({
  className,
  variant = "surface",
  flat = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // rounded-none is explicit: a rounded corner is the single
        // fastest way to break the pixel read.
        "border-4 border-ink rounded-none",
        !flat && "shadow-pixel",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* Header sits flush against the top edge with a hard rule beneath —
   an inset header with padding would float, and nothing here floats. */
export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-b-4 border-ink bg-section-header px-4 py-3",
        "font-pixel text-pixel-xs uppercase text-section-header-text",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-t-4 border-ink px-4 py-3",
        "flex items-center gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* Interactive variant — for grids of selectable games or albums.
   Presses like the Button so the whole system reacts the same way. */
export interface CardButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  selected?: boolean;
}

export function CardButton({
  className,
  variant = "surface",
  selected = false,
  type = "button",
  children,
  ...props
}: CardButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "block w-full text-left",
        "border-4 border-ink rounded-none shadow-pixel",
        VARIANTS[variant],
        "transition-[transform,box-shadow] duration-75 ease-pixel",
        "hover:-translate-y-0.5",
        "active:translate-y-0.75 active:shadow-pixel-pressed",
        "focus-visible:outline-none",
        "focus-visible:shadow-[0_4px_0_var(--color-ink),0_0_0_4px_var(--color-ink)]",
        selected && "translate-y-0.75 shadow-pixel-pressed",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
