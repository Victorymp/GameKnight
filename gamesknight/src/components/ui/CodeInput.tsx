import { useRef } from "react";
import { cn } from "../../lib/utils";

const LENGTH = 6;

export function CodeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.padEnd(LENGTH).split("").slice(0, LENGTH);

  function setChar(i: number, char: string) {
    const next = chars.slice();
    next[i] = char || " ";
    onChange(next.join("").trimEnd());
    if (char && i < LENGTH - 1) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !chars[i].trim() && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").toUpperCase().slice(0, LENGTH);
    onChange(text);
    refs.current[Math.min(text.length, LENGTH - 1)]?.focus();
  }

  return (
    <div className="flex justify-center gap-1.5" onPaste={handlePaste}>
      {chars.map((char, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={char.trim()}
          maxLength={1}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          aria-label={`Game code character ${i + 1}`}
          onChange={(e) => setChar(i, e.target.value.toUpperCase())}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-10 rounded-none text-center",
            "border-4 border-ink bg-surface shadow-pixel-sm",
            "font-pixel text-pixel-base text-ink",
            "focus:outline-none focus:shadow-[0_2px_0_var(--color-ink),0_0_0_3px_var(--color-accent)]"
          )}
        />
      ))}
    </div>
  );
}