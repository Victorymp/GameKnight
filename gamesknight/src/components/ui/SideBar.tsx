import { NavLink } from "react-router-dom";
import { Card } from "./Card";

export interface SideBarProp extends React.HTMLAttributes<HTMLDivElement> {}

const navItems = [
  { label: "Home", to: "/" },
  { label: "Game", to: "/game" },
  { label: "Make a Quiz", to: "/game/make" },
  { label: "Join a Game", to: "/player/joining" },
];

export default function SideBar({ className, ...props }: SideBarProp) {
  return (
    <div
      className={`w-56 shrink-0 h-full flex flex-col gap-2 p-3 ${className ?? ""}`}
      {...props}
    >
      <Card className="flex-1 flex flex-col gap-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </Card>
    </div>
  );
}