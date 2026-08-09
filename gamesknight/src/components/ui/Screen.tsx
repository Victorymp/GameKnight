import { Menu, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";


export interface ScreenProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Screen({ className, ...props}:ScreenProps){

  return(
    <div 
      className={cn(
              "min-h-screen bg-primary-light text-text",
              className
            )}
      {...props}
    >

    </div>
  );
}

export function Header({ className, ...props}:ScreenProps){

  return (
    <div
    className={cn(
              "",
              className
            )}
      {...props}
    >
      {/* Top Bar */}
      <header className="grid grid-cols-3 items-center justify-between bg-page text-black px-5 py-2.5 min-h-13 shrink-0">
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
    </div>
  );
}