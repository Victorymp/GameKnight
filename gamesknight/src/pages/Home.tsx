import { Card } from "../components/ui/Card"

import { Menu, Search } from "lucide-react";
import { Button } from "../components/ui/Button";

import getGameQr, { imageToBase64 } from "../components/services/generateQr";
import { useState } from "react";

export default function Home() {

  const [gameCodeQr, setGameCodeQr] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function getGameCodes() {
    setError(undefined);
    setIsLoading(true);

    try {
      const gameQrPath = getGameQr();
      const base64 = await imageToBase64(gameQrPath);
      setGameCodeQr(base64);
    } catch (err) {
      setError("Unable to load QR image.");
      setGameCodeQr(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary-light text-text">
      {/* Top Bar */}
      <header className="grid grid-cols-3 items-center justify-between bg-page text-black px-5 py-2.5 min-h-[52px] shrink-0">
        <div className="flex items-center gap-2">
          <Menu size={14}/>
          <h1 className="text-xl font-semibold">Games Knight</h1>
        </div>
        <div className="justify-self-center">
          <Button
            variant="outline"
          >
            <Search size={14}/>
          </Button>
        </div>
        <div className="flex items-center gap-2.5 px-2 py-1 justify-self-end">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
          </div>
          <div className="flex flex-col leading-tight">
            {/* <span className="text-[12px] font-semibold text-white/85">{engName}</span> */}
            <span className="text-[10px] text-black/40">Player</span>
            <span className="self-start w-fit mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-accent text-white">V</span>
          </div>
        </div>
      </header>

      {/* Testing the multiplayer connection */}
      <div className="flex flex-1 gap-2 py-3 px-3">

        <Card>
          <Button
            onClick={() => getGameCodes() }
          >
            Start Game
          </Button>
        </Card>
      </div>
      <div className="flex flex-1 gap-2 py-3 px-3">
        <Card>
          {isLoading ? (
              <div>
                <span>Loading QR...</span>
              </div>
            ) : error ? (
              <div>
                <span>{error}</span>
              </div>
            ) : gameCodeQr ? (
              <div>
                <img src={gameCodeQr} alt="Game QR" />
                <span>Has code</span>
              </div>
            ) : (
              <div>
                <span>No code</span>
              </div>
            )}
        </Card>
      </div>
    </div>
  )
}