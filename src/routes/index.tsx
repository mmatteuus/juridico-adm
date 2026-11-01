import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Scale, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { actions } from "@/features/demo/store";
import { ROLES } from "@/features/demo/roles";
import type { RoleKey } from "@/features/demo/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JURIDO SuperAdmin — Entrada de demonstração" },
      { name: "description", content: "Painel de controle da plataforma SaaS JURIDO em modo demonstração." },
      { property: "og:title", content: "JURIDO SuperAdmin — Demonstração" },
      { property: "og:description", content: "Protótipo navegável do painel do operador do SaaS jurídico JURIDO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DemoEntry,
});

function DemoEntry() {
  const [role, setRole] = useState<RoleKey>("owner");
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><Scale className="size-5" /></span><span className="font-semibold tracking-wide text-sidebar-accent-foreground">JURIDO · SuperAdmin</span></div>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-sidebar-accent-foreground">Centro de comando da plataforma.</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed">Escritórios, planos, licenças, faturamento, revenda, suporte, infraestrutura e ecossistema de API — em um só painel. O operador gerencia contas do SaaS, nunca autos ou documentos dos escritórios.</p>
        </div>
        <p className="text-xs text-sidebar-foreground/60">platform-admin · versão própria e independente</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-start gap-2 rounded-[var(--radius)] border border-warning/40 bg-warning-soft p-3 text-sm text-warning">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p><strong>Sem autenticação real.</strong> Escolha um perfil de demonstração. Todos os dados são fictícios e ficam apenas neste navegador.</p>
          </div>
          <h2 className="text-xl font-semibold">Entrar na demonstração</h2>
          <fieldset className="mt-4">
            <Label asChild><legend className="mb-2">Perfil DEMO</legend></Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(ROLES) as RoleKey[]).map((k) => (
                <label key={k} className={cn("cursor-pointer rounded-md border bg-card px-3 py-2.5 text-sm transition-colors", role === k ? "border-primary bg-accent text-accent-foreground" : "hover:border-primary/40")}>
                  <input type="radio" name="role" value={k} checked={role === k} onChange={() => setRole(k)} className="sr-only" />
                  {ROLES[k]}
                </label>
              ))}
            </div>
          </fieldset>
          <Button className="mt-6 w-full" size="lg" onClick={() => { actions.signIn(role); navigate({ to: "/platform/dashboard" }); }}>Entrar</Button>
        </div>
      </div>
    </div>
  );
}
