import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Home as HomeIcon } from "lucide-react";

const ROUTES = ["/", "/estimation", "/settings"];
const TITLES = {
  "/": "ImmoEstim",
  "/estimation": "Estimation",
  "/settings": "Paramètres",
};

export default function MobileHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  if (!ROUTES.includes(location.pathname)) return null;
  const canBack = location.pathname !== "/";

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
        <div className="flex items-center gap-2 font-heading font-semibold text-primary">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground">
            <HomeIcon className="w-4 h-4" />
          </span>
          {TITLES[location.pathname]}
        </div>
        <div className="w-10" />
      </div>
    </header>
  );
}