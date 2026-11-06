import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity, BadgeDollarSign, Bell, Boxes, Building2, ChevronsLeft, Cloud, Code2, Coins, Database, FileStack, Gauge, Globe, Handshake,
  KeyRound, LifeBuoy, ListChecks, LogOut, Menu, Rocket, RotateCcw, Scale, Search, Settings, ShieldCheck, Siren, Workflow, UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { actions, useDemo, type SourceMode } from "@/features/demo/store";
import { ROLES, canAccess } from "@/features/demo/roles";
import type { RoleKey } from "@/features/demo/types";
import { DemoDataBadge } from "./kit";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: typeof Gauge; section: string };
export const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Visão geral", items: [{ to: "/platform/dashboard", label: "Dashboard", icon: Gauge, section: "dashboard" }] },
  { group: "Comercial", items: [
    { to: "/platform/escritorios", label: "Escritórios", icon: Building2, section: "escritorios" },
    { to: "/platform/planos", label: "Planos", icon: Boxes, section: "planos" },
    { to: "/platform/licencas", label: "Licenças", icon: KeyRound, section: "licencas" },
    { to: "/platform/assinaturas", label: "Assinaturas", icon: FileStack, section: "assinaturas" },
    { to: "/platform/financeiro", label: "Financeiro", icon: BadgeDollarSign, section: "financeiro" },
    { to: "/platform/revendedores", label: "Revendedores", icon: Handshake, section: "revendedores" },
  ] },
  { group: "Operação", items: [
    { to: "/platform/suporte", label: "Suporte", icon: LifeBuoy, section: "suporte" },
    { to: "/platform/incidentes", label: "Incidentes", icon: Siren, section: "incidentes" },
  ] },
  { group: "Infraestrutura", items: [
    { to: "/platform/infra/banco", label: "Banco (Neon)", icon: Database, section: "infra" },
    { to: "/platform/infra/trafego", label: "Workers e API", icon: Activity, section: "infra" },
    { to: "/platform/infra/dominios", label: "Domínios", icon: Globe, section: "infra" },
    { to: "/platform/infra/filas", label: "Filas e jobs", icon: Workflow, section: "infra" },
    { to: "/platform/infra/custos", label: "Custos (FinOps)", icon: Coins, section: "infra" },
  ] },
  { group: "Governança", items: [
    { to: "/platform/contas", label: "Contas da equipe", icon: UsersRound, section: "contas" },
    { to: "/platform/seguranca", label: "Segurança", icon: ShieldCheck, section: "seguranca" },
    { to: "/platform/developers", label: "Developer Platform", icon: Code2, section: "developers" },
    { to: "/platform/releases", label: "Releases", icon: Rocket, section: "releases" },
    { to: "/platform/configuracoes", label: "Configurações", icon: Settings, section: "configuracoes" },
  ] },
];

function SidebarNavigation({ collapsed, role, onNavigate }: { collapsed: boolean; role: RoleKey; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Navegação principal" className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
      {NAV.map((g) => {
        const items = g.items.filter((i) => canAccess(role, i.section));
        if (!items.length) return null;
        return (
          <div key={g.group}>
            {!collapsed && <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">{g.group}</p>}
            <ul className="space-y-0.5">
              {items.map((i) => {
                const active = path === i.to || path.startsWith(i.to + "/");
                return (
                  <li key={i.to}>
                    <Link to={i.to} onClick={onNavigate} title={collapsed ? i.label : undefined} aria-current={active ? "page" : undefined}
                      className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-150", active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground", collapsed && "justify-center")}>
                      <i.icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} />
                      {!collapsed && i.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("flex h-14 items-center gap-2 border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
      <span className="grid size-8 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><Scale className="size-4" /></span>
      {!collapsed && <div className="leading-tight"><p className="text-sm font-semibold text-sidebar-accent-foreground">JURIDO</p><p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">SuperAdmin</p></div>}
    </div>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const tenants = useDemo((s) => s.tenants);
  const tickets = useDemo((s) => s.tickets);
  const resellers = useDemo((s) => s.resellers);
  const staff = useDemo((s) => s.staff);
  const role = useDemo((s) => s.role);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen((o) => !o); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  const go = (to: string) => { setOpen(false); navigate({ to }); };
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground hover:border-primary/40">
        <Search className="size-4 shrink-0" /><span className="min-w-0 flex-1 truncate text-left"><span className="sm:hidden">Buscar…</span><span className="hidden sm:inline">Buscar escritório, ticket, parceiro…</span></span><kbd className="hidden rounded border px-1 text-[10px] sm:inline">Ctrl K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Pesquisar dados administrativos (DEMO)…" />
        <CommandList>
          <CommandEmpty>Nenhum resultado.</CommandEmpty>
          {canAccess(role, "escritorios") && <CommandGroup heading="Escritórios">{tenants.map((t) => <CommandItem key={t.id} value={`${t.displayName} ${t.id}`} onSelect={() => go(`/platform/escritorios/${t.id}`)}>{t.displayName}<span className="ml-auto text-xs text-muted-foreground">{t.id}</span></CommandItem>)}</CommandGroup>}
          {canAccess(role, "suporte") && <CommandGroup heading="Chamados">{tickets.map((t) => <CommandItem key={t.id} value={`${t.id} ${t.subject}`} onSelect={() => go(`/platform/suporte/${t.id}`)}>{t.id} — {t.subject}</CommandItem>)}</CommandGroup>}
          {canAccess(role, "revendedores") && <CommandGroup heading="Parceiros">{resellers.map((r) => <CommandItem key={r.id} value={`${r.name} ${r.id}`} onSelect={() => go(`/platform/revendedores/${r.id}`)}>{r.name}</CommandItem>)}</CommandGroup>}
          {canAccess(role, "contas") && <CommandGroup heading="Contas da equipe">{staff.map((m) => <CommandItem key={m.id} value={`${m.name} ${m.id} ${ROLES[m.role]}`} onSelect={() => go("/platform/contas")}>{m.name}<span className="ml-auto text-xs text-muted-foreground">{ROLES[m.role]}</span></CommandItem>)}</CommandGroup>}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function AlertCenter() {
  const notifications = useDemo((s) => s.notifications);
  const [filter, setFilter] = useState<"todas" | "nao_lidas">("todas");
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;
  const list = filter === "todas" ? notifications : notifications.filter((n) => !n.read);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notificações, ${unread} não lidas`} className="relative">
          <Bell />{unread > 0 && <span className="tnum absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-semibold text-destructive-foreground">{unread}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">Notificações <DemoDataBadge /></DropdownMenuLabel>
        <div className="flex gap-1 px-2 pb-2">
          {(["todas", "nao_lidas"] as const).map((f) => <button key={f} onClick={(e) => { e.preventDefault(); setFilter(f); }} className={cn("rounded px-2 py-0.5 text-xs", filter === f ? "bg-primary text-primary-foreground" : "bg-muted")}>{f === "todas" ? "Todas" : "Não lidas"}</button>)}
          <button onClick={(e) => { e.preventDefault(); actions.readAll(); }} className="ml-auto text-xs text-primary">Marcar todas</button>
        </div>
        <DropdownMenuSeparator />
        {list.length === 0 ? <p className="p-3 text-center text-sm text-muted-foreground">Sem notificações.</p> : list.map((n) => (
          <DropdownMenuItem key={n.id} onSelect={() => { actions.readNotification(n.id); navigate({ to: n.to }); }} className="flex items-start gap-2">
            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-muted" : "bg-primary")} />
            <span className="text-sm">{n.title}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2 py-1 text-[11px] text-muted-foreground">Notificações internas — nenhuma mensagem externa é enviada.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RoleDemoSwitcher() {
  const role = useDemo((s) => s.role);
  const mode = useDemo((s) => s.sourceMode);
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted" aria-label="Menu de perfil">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">MO</span>
          <span className="hidden text-left leading-tight lg:block"><span className="block text-sm font-medium">Marina Okada</span><span className="block text-[11px] text-muted-foreground">{ROLES[role]}</span></span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Perfil DEMO (não é autenticação)</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={role} onValueChange={(v) => { actions.setRole(v as RoleKey); toast.success(`Perfil alterado para ${ROLES[v as RoleKey]} (DEMO)`); }}>
          {(Object.keys(ROLES) as RoleKey[]).map((k) => <DropdownMenuRadioItem key={k} value={k}>{ROLES[k]}</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Simular estado das fontes</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mode} onValueChange={(v) => actions.setSourceMode(v as SourceMode)}>
          <DropdownMenuRadioItem value="ok">Fonte com valor</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="partial">Fonte parcial</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="unavailable">Fonte indisponível</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { actions.reset(); toast.success("Dados demonstrativos restaurados"); }}><RotateCcw /> Restaurar dados demonstrativos</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { actions.signOut(); navigate({ to: "/" }); }}><LogOut /> Sair da demonstração</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Breadcrumb() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = useMemo(() => {
    const flat = NAV.flatMap((g) => g.items);
    const item = [...flat].sort((a, b) => b.to.length - a.to.length).find((i) => path.startsWith(i.to));
    const out = ["Plataforma"]; if (item) out.push(item.label);
    if (item && path !== item.to) out.push(decodeURIComponent(path.slice(item.to.length + 1)));
    return out;
  }, [path]);
  return (
    <nav aria-label="Trilha" className="hidden text-sm text-muted-foreground md:block">
      {crumbs.map((c, i) => <span key={i}>{i > 0 && <span className="mx-1.5">/</span>}<span className={i === crumbs.length - 1 ? "font-medium text-foreground" : ""}>{c}</span></span>)}
    </nav>
  );
}

export function AdminAppShell({ children }: { children: ReactNode }) {
  const role = useDemo((s) => s.role);
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      <a href="#conteudo" className="sr-only z-50 rounded bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-2 focus:top-2">Pular para o conteúdo</a>
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar transition-[width] duration-200 md:flex", collapsed ? "w-[72px]" : "w-[72px] lg:w-64")}>
        <div className="lg:hidden"><Brand collapsed /></div>
        <div className="hidden lg:block"><Brand collapsed={collapsed} /></div>
        <div className="lg:hidden flex flex-1 flex-col overflow-hidden"><SidebarNavigation collapsed role={role} /></div>
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden"><SidebarNavigation collapsed={collapsed} role={role} /></div>
        <button type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expandir menu" : "Recolher menu"} className="hidden items-center gap-2 border-t border-sidebar-border px-4 py-3 text-xs text-sidebar-foreground hover:text-sidebar-accent-foreground lg:flex">
          <ChevronsLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />{!collapsed && "Recolher"}
        </button>
      </aside>
      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="flex w-72 flex-col border-0 bg-sidebar p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Brand collapsed={false} /><SidebarNavigation collapsed={false} role={role} onNavigate={() => setMobile(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/95 px-3 backdrop-blur sm:px-5">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu" onClick={() => setMobile(true)}><Menu /></Button>
          <Breadcrumb />
          <div className="flex flex-1 justify-center"><GlobalSearch /></div>
          <span className="hidden items-center gap-1.5 rounded-md border border-warning/40 bg-warning-soft px-2 py-1 text-[11px] font-semibold text-warning sm:inline-flex"><Cloud className="size-3" /> AMBIENTE DEMO</span>
          <AlertCenter />
          <RoleDemoSwitcher />
        </header>
        <main id="conteudo" className="mx-auto w-full max-w-[1440px] flex-1 px-3 py-6 sm:px-6">{children}</main>
        <footer className="border-t px-6 py-3 text-[11px] text-muted-foreground"><ListChecks className="mr-1 inline size-3" />JURIDO SuperAdmin · platform-admin v0.4.0 (demo) · Nenhum provedor conectado — demonstração.</footer>
      </div>
    </div>
  );
}
