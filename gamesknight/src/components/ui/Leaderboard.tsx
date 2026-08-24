import { Card } from "./Card";
import type { Player } from "../../models/model";

type LeaderboardProps = {
  players: Player[];
};

export default function Leaderboard({ players }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  console.log(players);
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Leaderboard</h2>

        <div className="flex flex-col">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between border-b last:border-b-0 py-3 text-black"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 text-center font-semibold">
                  {index + 1}
                </span>

                <span>{player.displayName}</span>
              </div>

              <span className="font-semibold">
                {player.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}