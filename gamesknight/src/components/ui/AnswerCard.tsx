import * as React from "react";
import { cn } from "../../lib/utils";
import { PixelGlyph, ANSWER_SLOTS } from "./PixelStyle";

/* ------------------------------------------------------------------ *
 * Pixel sprite glyphs.
 * '#' fills, '.' is empty — edit the strings to change the shapes.
 * Four shapes so answers stay distinguishable without relying on
 * colour: matters for colour-blind players, and for reading the
 * host screen from the back of a room.
 * ------------------------------------------------------------------ */



/* Four fixed identities, assigned by index — so answer 2 looks the
   same on the TV and on every phone. */


export interface AnswerCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** 0–3. Decides shape and fill. */
  index: number;
  /** Omit on the phone — the text is already on the big screen. */
  label?: string;
  selected?: boolean;
  correct?: boolean;
  revealed?: boolean;
  /** Host screen: not clickable, larger type. */
  display?: boolean;
  /** Host reveal: draws a vote bar across the card. */
  count?: number;
  totalVotes?: number;
}

export function AnswerCard({
  index,
  label,
  selected = false,
  correct = false,
  revealed = false,
  display = false,
  count,
  totalVotes,
  className,
  disabled,
  ...props
}: AnswerCardProps) {
  const slot = ANSWER_SLOTS[index % ANSWER_SLOTS.length];
  const glyphOnly = !label;

  // Wrong answers recede rather than vanish — players need to see
  // what they picked.
  const faded = revealed && !correct;

  const share =
    typeof count === "number" && totalVotes && totalVotes > 0
      ? Math.round((count / totalVotes) * 100)
      : 0;

  return (
    <button
      type="button"
      disabled={disabled || display}
      aria-pressed={selected}
      className={cn(
        "relative w-full overflow-hidden text-left",
        "border-4 border-ink rounded-none shadow-pixel",
        "font-pixel uppercase",
        slot.fill,
        slot.text,

        glyphOnly
          ? "flex items-center justify-center px-4 py-6"
          : "flex items-center gap-4",
        !glyphOnly && (display ? "px-6 py-6 text-pixel-base" : "px-4 py-5 text-pixel-sm"),

        "transition-[transform,box-shadow,opacity] duration-75 ease-pixel",
        !display &&
          !disabled && [
            "hover:-translate-y-0.5",
            "active:translate-y-0.75 active:shadow-pixel-pressed",
            "focus-visible:outline-none",
            "focus-visible:shadow-[0_4px_0_var(--color-ink),0_0_0_4px_var(--color-ink)]",
          ],

        // Selected sits pressed-in. No tick or ring needed — the
        // button simply stays down.
        selected && "translate-y-0.75 shadow-pixel-pressed",

        faded && "opacity-30",
        correct && revealed && "animate-bob",

        "disabled:cursor-default",
        className
      )}
      {...props}
    >
      {/* Vote bar, host reveal only. Sits behind the content. */}
      {revealed && typeof count === "number" && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-ink/20"
          style={{ width: `${share}%` }}
        />
      )}

      <PixelGlyph
        name={slot.glyph}
        size={glyphOnly ? 56 : display ? 40 : 28}
        className="relative"
      />

      {label && <span className="relative flex-1 leading-snug">{label}</span>}

      { typeof count === "number" && (
        <span className="relative shrink-0 text-pixel-xs">{count}</span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Block timer. Discrete blocks rather than a shrinking bar — a
 * smoothly animating width breaks the pixel language.
 * Takes the same ms values as your existing Timer.
 * ------------------------------------------------------------------ */

export function PixelTimer({
  msLeft,
  totalMs,
  blocks = 20,
  className,
}: {
  msLeft: number;
  totalMs: number;
  blocks?: number;
  className?: string;
}) {
  const ratio = totalMs > 0 ? Math.max(0, Math.min(1, msLeft / totalMs)) : 0;
  const lit = Math.ceil(ratio * blocks);

  return (
    <div
      className={cn("flex gap-1 border-4 border-ink bg-surface p-1", className)}
      role="timer"
      aria-label={`${Math.ceil(msLeft / 1000)} seconds left`}
    >
      {Array.from({ length: blocks }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 flex-1",
            i < lit
              ? ratio > 0.5
                ? "bg-success"
                : ratio > 0.25
                ? "bg-warning"
                : "bg-accent"
              : "bg-border"
          )}
        />
      ))}
    </div>
  );
}
