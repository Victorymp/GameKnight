import { useState } from "react";
import { Input } from "../../components/ui/Input";
import { Screen, Header } from "../../components/ui/Screen";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { CodeInput } from "../../components/ui/CodeInput";


export function PlayerJoin(){
  const [manualCode, setManualCode] = useState<string>("");
  function handleJoin(){
    console.log(manualCode);
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