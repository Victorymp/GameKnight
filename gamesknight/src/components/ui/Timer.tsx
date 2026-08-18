// src/components/game/Timer.tsx
type Props = {
  msLeft: number;
  totalMs: number;
  label?: string;
};

export function Timer({ msLeft, totalMs, label }: Props) {
  const pct = totalMs > 0 ? (msLeft / totalMs) * 100 : 0;

  return (
    <div>
      {label && <div className="text-sm mb-1">{label}</div>}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-400 transition-all duration-100"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}