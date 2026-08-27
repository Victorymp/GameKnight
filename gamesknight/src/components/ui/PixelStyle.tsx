// import * as React from "react";
import { cn } from "../../lib/utils";

export const GLYPHS = {
  square: [
    ".#####.",
    "#######",
    "#######",
    "#######",
    "#######",
    "#######",
    ".#####.",
  ],
  triangle: [
    "...#...",
    "...#...",
    "..###..",
    "..###..",
    ".#####.",
    ".#####.",
    "#######",
  ],
  diamond: [
    "...#...",
    "..###..",
    ".#####.",
    "#######",
    ".#####.",
    "..###..",
    "...#...",
  ],
  circle: [
    "..###..",
    ".#####.",
    "#######",
    "#######",
    "#######",
    ".#####.",
    "..###..",
  ],
} as const;

export type GlyphName = keyof typeof GLYPHS;

export function PixelGlyph({
  name,
  size = 28,
  className,
}: {
  name: GlyphName;
  size?: number;
  className?: string;
}) {
  const grid = GLYPHS[name];
  const cols = grid[0].length;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${cols} ${grid.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      fill="currentColor"
    >
      {grid.flatMap((row, y) =>
        row.split("").map((cell, x) =>
          cell === "#" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
          ) : null
        )
      )}
    </svg>
  );
}

export const ANSWER_SLOTS = [
  { glyph: "square" as GlyphName, fill: "bg-accent", text: "text-cloud" },
  { glyph: "triangle" as GlyphName, fill: "bg-sky-deep", text: "text-ink" },
  { glyph: "diamond" as GlyphName, fill: "bg-warning", text: "text-ink" },
  { glyph: "circle" as GlyphName, fill: "bg-success", text: "text-cloud" },
] as const;