import { useState } from "react";
import { Screen, Header } from "../../components/ui/Screen";
import { Button } from "../../components/ui/Button";
import { CodeInput } from "../../components/ui/CodeInput";
import { useNavigate } from "react-router-dom";


export function PlayerJoin(){
  const [manualCode, setManualCode] = useState<string>("");
  const navigate = useNavigate();
  function handleJoin(){
    console.log(manualCode);
    navigate(`/player/join/${manualCode}`)
  }
  return (
    <Screen>
    <Header />
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <span className="font-pixel text-pixel-xs text-ink">GAME CODE</span>
        <CodeInput value={manualCode} onChange={setManualCode} />
        <Button size="lg" onClick={handleJoin} disabled={manualCode.length < length}>
          Join
        </Button>
      </div> 
    </main>
    </Screen>
  )
}