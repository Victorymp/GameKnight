import * as React from "react";
import { Menu, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

/* ------------------------------------------------------------------ *
 * Screen
 * Page shell. flex-col so children can claim remaining height with
 * flex-1 — the old version left them unable to fill the viewport.
 * ------------------------------------------------------------------ */

export interface ScreenProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Screen({ className, children, ...props }: ScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-sky-pale text-ink",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Header
 * ------------------------------------------------------------------ */

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Shown next to the wordmark. */
  playerName?: string;
  /** Single character in the avatar tile. */
  initial?: string;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

export function Header({
  className,
  playerName = "Player",
  initial = "V",
  onMenuClick,
  onSearchClick,
  children,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        // A hard 4px underline instead of a drop shadow — the header
        // is a sprite edge, not a floating surface.
        "shrink-0 border-b-4 border-ink bg-page text-ink",
        "flex min-h-14 items-center gap-3 px-4 py-2",
        className
      )}
      {...props}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={16} strokeWidth={2.5} />
        </Button>

        <span className="font-pixel text-pixel-sm whitespace-nowrap">
          Games Knight
        </span>
      </div>

      {/* Centre — anything passed as children lands here. Collapses
          on small screens so the wordmark and avatar keep their room. */}
      <div className="hidden flex-1 items-center justify-center sm:flex">
        {children}
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <Button
          variant="outline"
          size="icon"
          onClick={onSearchClick}
          aria-label="Search games"
        >
          <Search size={16} strokeWidth={2.5} />
        </Button>

        <div className="flex items-center gap-2">
          {/* Square, not round. Pixel grids have no circles. */}
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center",
              "border-2 border-ink bg-primary",
              "font-pixel text-pixel-xs text-ink"
            )}
            aria-hidden="true"
          >
            {initial}
          </div>

          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              {playerName}
            </span>
            <span
              className={cn(
                "mt-0.5 w-fit self-start px-1.5 py-0.5",
                "border-2 border-ink bg-accent",
                "font-pixel text-[9px] uppercase text-cloud"
              )}
            >
              {initial}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
