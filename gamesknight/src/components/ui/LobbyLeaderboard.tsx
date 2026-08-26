import { Card } from "./Card";
import type { Player } from "../../models/model";
import { motion, AnimatePresence } from "framer-motion";
import LoadingThreeDotsJumping from "./Loadingdots";

type LobbyLeaderboardProps = {
  players: Player[];
  currentPlayerId?: string;
};

export default function LobbyLeaderboard({
  players,
  currentPlayerId,
}: LobbyLeaderboardProps) {
  if (players.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center gap-8">
        <p className="text-center text-slate-500">Waiting for players to join...</p>
        <LoadingThreeDotsJumping />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Players</h2>
          <span className="text-sm text-slate-500">
            {players.length} {players.length === 1 ? "joined" : "joined"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <AnimatePresence>
            {players.map((player) => {
              const displayName = player.name || "?";
              const isCurrent = currentPlayerId === player.id;
              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`
                    flex items-center gap-2 rounded-lg px-3 py-2 bg-slate-50 text-black
                    ${isCurrent ? "ring-2 ring-blue-400" : ""}
                  `}
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium truncate">
                    {displayName}
                    {isCurrent && (
                      <span className="ml-1 text-xs text-blue-600 font-normal">(you)</span>
                    )}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}