import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { BASE_URL } from "../../lib/http";
import { formatDateLong } from "../../lib/format";
import { Logo } from "../ui/Logo";
import { ThemeToggle } from "../ui/ThemeToggle";

const navigation = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/tecnicos", label: "Técnicos", icon: Wrench },
  { to: "/servicos", label: "Serviços", icon: ClipboardList },
];

const pageTitles: Record<string, string> = {
  "/": "Visão geral",
  "/agendamentos": "Agendamentos",
  "/clientes": "Clientes",
  "/tecnicos": "Técnicos",
  "/servicos": "Serviços",
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const host = BASE_URL.replace(/^https?:\/\//, "");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <NavLink to="/" onClick={onNavigate} aria-label="Pauta — início">
          <Logo />
        </NavLink>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Navegação principal">
        <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/70">
          Operação
        </p>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                    active
                      ? "bg-accent/[0.09] text-text"
                      : "text-muted hover:bg-surface-2 hover:text-text",
                  )}
                >
                  {active && (
                    <span
                      className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      active ? "text-accent" : "text-muted group-hover:text-text",
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 rounded-2xl border border-line bg-surface-2/60 p-4">
          <p className="font-display text-[13px] font-semibold text-text">Dica de operação</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Um técnico não pode ter dois agendamentos no mesmo horário. O sistema bloqueia o
            conflito automaticamente.
          </p>
        </div>
      </nav>

      <div className="border-t border-line p-3">
        <div className="rounded-xl border border-line bg-surface-2 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              API base
            </span>
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-muted/80" title={BASE_URL}>
            {host}
          </p>
        </div>
        <a
          href={`${BASE_URL}/swagger-ui/index.html`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted transition hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Documentação da API
        </a>
      </div>
    </div>
  );
}

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Pauta";

  useEffect(() => {
    document.title = `${title} · Pauta`;
  }, [title]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh bg-canvas text-text">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-ink"
      >
        Pular para o conteúdo
      </a>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[268px] border-r border-line bg-surface/70 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative h-full w-[286px] animate-slide-in border-r border-line bg-surface shadow-2xl">
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-[268px]">
        <header className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-line bg-surface-2 p-2 text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/70 sm:block">
                  Pauta / {title}
                </p>
                <h1 className="truncate font-display text-[15px] font-semibold text-text sm:text-base">
                  {title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted md:inline-flex">
                {formatDateLong(new Date())}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main id="conteudo" className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>

        <footer className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 px-4 pb-8 text-[11px] text-muted/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>pauta · gestão de agendamentos</p>
          <p>
            Feito para organizar clientes, técnicos e serviços em um só lugar.
          </p>
        </footer>
      </div>
    </div>
  );
}
