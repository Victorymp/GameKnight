// Where a player joins
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Header, Screen } from "../components/ui/Screen";
import { Input } from "../components/ui/Input";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { GameData } from "../models/model";
import { PlayerJoined } from "../components/players/PlayerJoined";
import { PlayerJoining } from "../components/players/PlayerJoining";


export default function Player(){
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<GameData | null>(null);

  useEffect(() => {
    if(!gameId) {
      console.log("No id");
      return;
    }

    console.log(gameId);
  })

  return (
    <>
      <Screen className="grid grid-cols-1 gap-1">
        <Header/>
        {gameId == "" ? (
          <PlayerJoining/>
        ) : (
          <PlayerJoined/>
        )}
      </Screen>
    </>

  )

}

