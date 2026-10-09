import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Logo from "@/components/Logo";

const ROUTES = ["/", "/estimation", "/settings"];
const TITLES = {
  "/": "Chevillette.fr",
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
      <div className="flex items-center justify-between px-2 py-4">
        <button
          type="button"
          onClick={() => canBack && navigate(-1)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-primary ${canBack ? "" : "opacity-0 pointer-events-none"}`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center justify-center">
          {isHome ? (
            <Logo height={36} />
          ) : (
            <span className="font-heading font-semibold text-primary">{TITLES[location.pathname]}</span>
          )}
        </div>
        <div className="w-10" />
      </div>
    </header>
  );
}