import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Home as HomeIcon } from "lucide-react";

const ROUTES = ["/", "/estimation", "/settings"];
const TITLES = {
  "/": "L'Indice Immo",
  "/estimation": "Estimation",
  "/settings": "Paramètres",
};

export default function MobileHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  if (!ROUTES.includes(location.pathname)) return null;
  const canBack = location.pathname !== "/";
  const isHome = location.pathname === "/";

  return (
    <header
      className="md:hidden sticky top-0 z-30 bg-card/90 backdrop-blur-sm border-b border-border/60"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="h-14 flex items-center justify-between px-2">
        <button
          type="button"
          onClick={() => canBack && navigate(-1)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-primary ${canBack ? "" : "opacity-0 pointer-events-none"}`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground">
            <HomeIcon className="w-4 h-4" />
          </span>
          {isHome ? (
            <span
              className="font-serif text-base font-semibold tracking-tight text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #E6C158 0%, #D4AF37 50%, #B8941F 100%)" }}
            >
              {TITLES[location.pathname]}
            </span>
          ) : (
            <span className="font-heading font-semibold text-primary">{TITLES[location.pathname]}</span>
          )}
        </div>
        <div className="w-10" />
      </div>
    </header>
  );
}