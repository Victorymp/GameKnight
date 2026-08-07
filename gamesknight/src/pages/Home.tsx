import { Card } from "../components/ui/Card"

import { Menu, Search } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function Home() {

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
      <div className="flex flex-1 gap-2 py-3 px-3 max-h-[180px]">

        <Card
          
        
        >
          <div className="flex">
            
          </div>

        </Card>
        
      </div>
    </div>
  )
}