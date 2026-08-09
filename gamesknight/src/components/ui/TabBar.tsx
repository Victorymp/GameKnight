import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
// import { statusTone, isKnownStatus, TONE_DOT } from "./StatusBadge";
import { Button } from "./Button";

/**
 * TabBar — a rounded card tab strip (the partition-tab look). Each tab is a small
 * pill that sits centred inside a fixed-height card, optionally with a leading icon
 * and a trailing status dot (coloured from the shared StatusBadge palette).
 *
 * Presentation only: the parent owns the active key and handles selection.
 */
export interface TabItem {
  /** Stable id passed back to onSelect. */
  key: string;
  label: string;
  icon?: LucideIcon;
  /** Optional status → coloured trailing dot (Pending / Complete / …). */
  status?: string;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** Extra classes for the card container (e.g. margins so it spans the content). */
  className?: string;
  /** Optional right-aligned content in the same card (e.g. a Save button). */
  actions?: ReactNode;
}

export function TabBar({ tabs, activeKey, onSelect, className, actions }: TabBarProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center min-h-12 gap-2 px-3 rounded-xl border border-gray-200 bg-white shadow-sm shrink-0 overflow-hidden",
        className,
      )}
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeKey === t.key;
        return (
          <Button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(t.key)}
            className={cn(
              "inline-flex items-center gap-1.5 self-center px-3.5 py-1.5 text-[12.5px] font-medium whitespace-nowrap border-b-[3px] transition-colors",
              isActive
                ? "text-[#0f6360] border-[#0f6360] bg-[#e7f1f0]"
                : "text-[#6b7a87] border-transparent hover:text-[#1a2630] hover:bg-[#f0f3f5]",
            )}
            variant="outline"
          >
            {Icon && <Icon size={14} />}
            {t.label}
            {/* {t.status && (
              <span className={cn("w-2 h-2 rounded-full shrink-0", isKnownStatus(t.status) ? TONE_DOT[statusTone(t.status)] : "bg-gray-300")} />
            )} */}
          </Button>
        );
      })}
      {actions && <div className="ml-auto flex items-center gap-2 pl-2 shrink-0">{actions}</div>}
    </div>
  );
}

export default TabBar;