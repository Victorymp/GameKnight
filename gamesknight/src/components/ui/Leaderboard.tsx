import { Card } from "./Card";
import type { Player } from "../../models/model";
import { motion, AnimatePresence } from "framer-motion";

type LeaderboardProps = {
  players: Player[];
  currentPlayerId?: string;
};

const RANK_STYLES = [
  {
    row: "bg-gradient-to-r from-yellow-100 to-yellow-50 border-l-4 border-yellow-400",
    icon: "🥇",
  },
  {
    row: "bg-gradient-to-r from-slate-100 to-slate-50 border-l-4 border-slate-400",
    icon: "🥈",
  },
  {
    row: "bg-gradient-to-r from-orange-100 to-orange-50 border-l-4 border-orange-400",
    icon: "🥉",
  },
];

export default function Leaderboard({ players, currentPlayerId }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  if (sortedPlayers.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-slate-500">No players yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Leaderboard</h2>
          <span className="text-sm text-slate-500">
            {sortedPlayers.length} {sortedPlayers.length === 1 ? "player" : "players"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <AnimatePresence>
            {sortedPlayers.map((player, index) => {
              const rank = index + 1;
              const style = RANK_STYLES[index];
              const isCurrent = currentPlayerId === player.id;

              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className={`
                    flex items-center justify-between rounded-lg px-3 py-3 text-black
                    ${style ? style.row : "bg-white border-l-4 border-transparent"}
                    ${isCurrent ? "ring-2 ring-blue-400" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {style ? (
                      <span className="text-2xl w-8 text-center">{style.icon}</span>
                    ) : (
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-slate-200 text-slate-700">
                        {rank}
                      </span>
                    )}

                    <span className="font-medium truncate max-w-45">
                      {player.name}
                      {isCurrent && (
                        <span className="ml-2 text-xs text-blue-600 font-normal">(you)</span>
                      )}
                    </span>
                  </div>

                  <motion.div
                    key={player.score}
                    initial={{ scale: 1.4, color: "#22c55e" }}
                    animate={{ scale: 1, color: "#000000" }}
                    transition={{ duration: 0.5 }}
                    className="flex items-baseline gap-1"
                  >
                    <span className="text-xl font-bold">{player.score.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">pts</span>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}