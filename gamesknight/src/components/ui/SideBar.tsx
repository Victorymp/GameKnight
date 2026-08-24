import { NavLink } from "react-router-dom";
import { Card } from "./Card";
import { CirclePlus, PenLine, Search, Telescope } from "lucide-react";


export interface SideBarProp extends React.HTMLAttributes<HTMLDivElement> {}

const navItems = [
  { label: "Home", to: "/", icon: Telescope },
  { label: "Search", to: "/game", icon: Search },
  { label: "Make", to: "/game/make", icon: PenLine },
  { label: "Join", to: "/player/joining", icon: CirclePlus },
];

export default function SideBar({ className, ...props }: SideBarProp) {
  return (
    <div
      className={`w-46 shrink-0 h-full flex flex-col gap-2 p-3 ${className ?? ""}`}
      {...props}
    >
      <Card className="flex-1 flex flex-col gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </Card>
    </div>
  );
}