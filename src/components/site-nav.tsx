"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Map,
  BarChart3,
  Building2,
  AlertTriangle,
  Code2,
  BookOpen,
  Info,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useState } from "react";

const NAV_GROUPS = [
  {
    label: "Dados",
    links: [
      { href: "/", label: "Ranking", icon: Trophy },
      { href: "/mapa", label: "Mapa", icon: Map },
      { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
      { href: "/comparativo", label: "Comparativo", icon: TrendingUp },
      { href: "/orgao", label: "Órgãos", icon: Building2 },
      { href: "/anomalias", label: "Anomalias", icon: AlertTriangle },
    ],
  },
  {
    label: "Info",
    links: [
      { href: "/api-docs", label: "API", icon: Code2 },
      { href: "/metodologia", label: "Metodologia", icon: BookOpen },
      { href: "/sobre", label: "Sobre", icon: Info },
    ],
  },
];

export function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-12 items-center border-b border-gray-100 bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="ml-3 font-serif text-lg font-bold">
          <span className="text-red-primary">Extra</span>
          <span className="text-navy">Teto</span>
        </span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-gray-100 bg-white transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center px-5">
          <Link href="/" className="font-serif text-xl font-bold" onClick={() => setMobileOpen(false)}>
            <span className="text-red-primary">Extra</span>
            <span className="text-navy">Teto</span>
          </Link>
        </div>

        {/* Links */}
        <div className="flex flex-1 flex-col gap-4 px-3 py-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.links.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-primary text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-navy"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-gray-400")} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </nav>
    </>
  );
}
