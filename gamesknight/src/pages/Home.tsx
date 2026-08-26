import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------ *
 * Tokens. Change SKY to your primary colour and everything follows.
 * ------------------------------------------------------------------ */
const SKY = "#3B82F6";        // primary
const SKY_DEEP = "#2563EB";   // top band
const SKY_PALE = "#7DAEFB";   // horizon band
const CLOUD = "#FFFFFF";
const CLOUD_SHADE = "#BFD7F5";
const GOLD = "#FFD166";
const ACCENT = "#EF476F";     // accent
const INK = "#10203A";

/* Routes — adjust to match your router. */
const ROUTE_HOST = "/games";
const ROUTE_JOIN = "/join";
const ROUTE_DISCOVER = "/discover";

/* ------------------------------------------------------------------ *
 * Pixel cloud. The shape is an ASCII grid, so it stays editable:
 * '#' is cloud, ',' is the shaded underside, '.' is empty.
 * ------------------------------------------------------------------ */
const CLOUD_GRID = [
  "......####......",
  "....########....",
  "..###########...",
  ".##############.",
  "################",
  ".,,,,,,,,,,,,,,.",
];

function PixelCloud({
  scale = 4,
  opacity = 1,
  className = "",
}: {
  scale?: number;
  opacity?: number;
  className?: string;
}) {
  const cols = CLOUD_GRID[0].length;
  const rows = CLOUD_GRID.length;

  return (
    <svg
      width={cols * scale}
      height={rows * scale}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
      style={{ opacity }}
    >
      {CLOUD_GRID.flatMap((row, y) =>
        row.split("").map((cell, x) =>
          cell === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={cell === "," ? CLOUD_SHADE : CLOUD}
            />
          )
        )
      )}
    </svg>
  );
}

/* A single drifting layer. Duration and vertical offset set the parallax. */
function CloudLayer({
  top,
  scale,
  duration,
  delay = 0,
  opacity = 1,
}: {
  top: string;
  scale: number;
  duration: number;
  delay?: number;
  opacity?: number;
}) {
  return (
    <div
      className="gk-drift pointer-events-none absolute left-0"
      style={{
        top,
        animationDuration: `${duration}s`,
        animationDelay: `-${delay}s`,
      }}
    >
      <PixelCloud scale={scale} opacity={opacity} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: SKY }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap');

        .gk-pixel { font-family: 'Silkscreen', ui-monospace, monospace; }

        .gk-drift {
          animation-name: gk-drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes gk-drift {
          from { transform: translateX(-40vw); }
          to   { transform: translateX(140vw); }
        }

        /* Hard-edged 8-bit press, no soft shadows. */
        .gk-btn {
          image-rendering: pixelated;
          transition: transform 80ms steps(2), box-shadow 80ms steps(2);
        }
        .gk-btn:hover  { transform: translateY(-2px); }
        .gk-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 ${INK}; }
        .gk-btn:focus-visible {
          outline: 3px solid ${GOLD};
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .gk-drift { animation: none; }
          .gk-btn { transition: none; }
        }
      `}</style>

      {/* Banded sky — pixel art bands, not a smooth gradient. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div style={{ height: "38%", backgroundColor: SKY_DEEP }} />
        <div style={{ height: "34%", backgroundColor: SKY }} />
        <div style={{ height: "28%", backgroundColor: SKY_PALE }} />
      </div>

      {/* Parallax clouds: far ones small, faint and slow. */}
      <CloudLayer top="12%" scale={3} duration={90} delay={0} opacity={0.55} />
      <CloudLayer top="26%" scale={5} duration={64} delay={22} opacity={0.8} />
      <CloudLayer top="58%" scale={8} duration={46} delay={9} opacity={1} />
      <CloudLayer top="74%" scale={4} duration={78} delay={40} opacity={0.65} />

      {/* Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <p
            className="gk-pixel text-xs tracking-[0.35em]"
            style={{ color: GOLD }}
          >
            EVERYONE PLAYS
          </p>

          <h1
            className="gk-pixel text-4xl leading-tight sm:text-6xl"
            style={{ color: CLOUD, textShadow: `4px 4px 0 ${INK}` }}
          >
            GamesKnight
          </h1>

          <p
            className="max-w-md text-base sm:text-lg"
            style={{ color: CLOUD }}
          >
            Put the quiz on the big screen. Everyone else joins from their
            phone. No apps, no accounts — just a code.
          </p>
        </div>

        <div className="flex w-full max-w-sm flex-col items-center gap-5 sm:max-w-none">
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate(ROUTE_HOST)}
              className="gk-btn gk-pixel px-8 py-4 text-sm"
              style={{
                backgroundColor: GOLD,
                color: INK,
                border: `4px solid ${INK}`,
                boxShadow: `0 4px 0 ${INK}`,
              }}
            >
              Start a game
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTE_JOIN)}
              className="gk-btn gk-pixel px-8 py-4 text-sm"
              style={{
                backgroundColor: CLOUD,
                color: INK,
                border: `4px solid ${INK}`,
                boxShadow: `0 4px 0 ${INK}`,
              }}
            >
              Join with a code
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTE_DISCOVER)}
            className="gk-btn gk-pixel px-6 py-3 text-xs"
            style={{
              backgroundColor: ACCENT,
              color: CLOUD,
              border: `4px solid ${INK}`,
              boxShadow: `0 4px 0 ${INK}`,
            }}
          >
            Discover games
          </button>
        </div>
      </main>

      {/* Pixel ground: a hard 8px band, no rounding. */}
      <div
        className="relative z-10 h-2 w-full"
        style={{ backgroundColor: INK }}
        aria-hidden="true"
      />
    </div>
  );
}