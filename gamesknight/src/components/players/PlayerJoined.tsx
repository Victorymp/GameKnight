// Where a player joins
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Header, Screen } from "../ui/Screen";
import { Input } from "../ui/Input";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { GameData } from "../../models/model";
import gameController from "../controllers/game-controller";

interface NewPlayer{
  displayName: string;
  gameId: string;
}

interface PlayerJoinedProps {
  gameCode: string;
}

export function PlayerJoined(){
  const [displayName, setDisplayName] = useState<string>("");
  const [game, setGame] = useState<GameData | null>(null);

  // useEffect(() => {
  //   if (!gameCode) return;

  //   const join = async () => {
  //     const result = await gameController.joinGame(gameCode);
  //     setGame(result ?? null);
  //   };

  //   join();
  // }, [gameCode]);

  function addPlayerToGame(){
    // send 
  }

  return (
    <div>

      <Card className="grid grid-cols-1 gap-4 justify-items-center">
        <p className="text-center">Enter a display name</p>
        <Input className="text-center" 
          value={displayName} 
          onChange={(event) => setDisplayName(event.target.value)}></Input>
        <Input></Input>
        <Input></Input>
        <Button className="" onSelect={() => addPlayerToGame()}>Enter</Button>
      </Card>
    </div>
  )
}



