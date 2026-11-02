import { createFileRoute } from "@tanstack/react-router";
import { InfraPage } from "@/components/admin/InfraPage";
import { Panel, StatusBadge, UnavailableState } from "@/components/admin/kit";
import { Progress } from "@/components/ui/progress";
import { brl, useDemo } from "@/features/demo/store";

const PROVIDERS = [{ name: "Cloudflare (Workers, R2, Queues)", value: 412000 }, { name: "Neon PostgreSQL", value: 538000 }, { name: "E-mail transacional", value: 96000 }, { name: "Observabilidade", value: 202000 }];
const BUDGET = 1500000;

export const Route = createFileRoute("/platform/infra/custos")({
  head: () => ({ meta: [{ title: "Custos (FinOps) — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: Custos,
});

function Custos() {
  const tenants = useDemo((s) => s.tenants);
  const total = PROVIDERS.reduce((a, p) => a + p.value, 0);
  return (
    <InfraPage title="Custos (FinOps)" description="Custos por provedor, orçamento e anomalias. Custo por escritório é sempre estimativa." source="Faturas de provedores (não conectado)"
      metrics={[{ key: "cost", label: "Custo diário", unit: "R$", status: "estimate", agg: "sum", type: "bar" }]}>
      {({ status }) => status === "unavailable" ? <Panel title="Custos"><UnavailableState /></Panel> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Por provedor" description="Estimativa mensal" actions={<StatusBadge status="estimate" />}>
            <ul className="space-y-3 text-sm">{PROVIDERS.map((p) => <li key={p.name}><div className="flex justify-between"><span>{p.name}</span><span className="tnum">{brl(p.value)}</span></div><Progress value={(p.value / total) * 100} className="mt-1 h-1.5" /></li>)}</ul>
            <div className="mt-4 border-t pt-3 text-sm"><div className="flex justify-between font-semibold"><span>Total vs. orçamento</span><span className="tnum">{brl(total)} / {brl(BUDGET)}</span></div><Progress value={(total / BUDGET) * 100} className="mt-1 h-2" /></div>
            <p className="mt-3 rounded-md bg-warning-soft p-2 text-xs text-warning">Anomalia (DEMO): Neon +18% vs. semana anterior.</p>
          </Panel>
          <Panel title="Custo estimado por escritório" actions={<StatusBadge status="estimate" />}>
            <ul className="divide-y text-sm">{[...tenants].sort((a, b) => b.storageGb - a.storageGb).slice(0, 8).map((t) => <li key={t.id} className="flex justify-between py-2"><span>{t.displayName}</span><span className="tnum">{brl(t.storageGb * 45 + t.activeSeats * 120)}</span></li>)}</ul>
            <p className="mt-2 text-xs text-muted-foreground">Rateio proporcional de recurso compartilhado — não é valor medido.</p>
          </Panel>
        </div>
      )}
    </InfraPage>
  );
}
