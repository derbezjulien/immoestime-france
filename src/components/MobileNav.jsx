import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home as HomeIcon, Calculator, Settings as SettingsIcon } from "lucide-react";

const ROUTES = ["/", "/estimation", "/settings"];
const TABS = [
  { path: "/", label: "Accueil", Icon: HomeIcon },
  { path: "/estimation", label: "Estimation", Icon: Calculator },
  { path: "/settings", label: "Réglages", Icon: SettingsIcon },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  if (!ROUTES.includes(location.pathname)) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-sm border-t border-border/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {TABS.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center gap-1 py-2"
            >
              <Icon className={`w-5 h-5 ${active ? "text-accent" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-medium ${active ? "text-accent" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}