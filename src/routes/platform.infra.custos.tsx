import { createFileRoute } from "@tanstack/react-router";
import { InfraPage } from "@/components/admin/InfraPage";
import { Panel, ResourceTable, StatusBadge, UnavailableState } from "@/components/admin/kit";
import { Progress } from "@/components/ui/progress";
import { brl, useDemo } from "@/features/demo/store";
import type { ProviderCostAllocation, TenantSummary } from "@/features/demo/types";

export const Route = createFileRoute("/platform/infra/custos")({
  head: () => ({ meta: [
    { title: "Custos (FinOps) — JURIDO SuperAdmin" },
    { name: "description", content: "Estimativas de custos por provedor e escritório da plataforma JURIDO." },
    { property: "og:title", content: "Custos (FinOps) — JURIDO SuperAdmin" },
    { property: "og:description", content: "Estimativas de custos por provedor e escritório da plataforma JURIDO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Custos,
});

function Custos() {
  const tenants = useDemo((s) => s.tenants);
  const providers = useDemo((s) => s.providerCosts);
  const budget = useDemo((s) => s.providerBudgetMinor);
  const total = providers.reduce((a, p) => a + p.amountMinor, 0);
  return (
    <InfraPage title="Custos (FinOps)" description="Custos por provedor, orçamento e anomalias. Custo por escritório é sempre estimativa." source="Faturas de provedores (não conectado)"
      metrics={[{ key: "cost", label: "Custo diário", unit: "R$", status: "estimate", agg: "sum", type: "bar" }]}>
      {({ status }) => status === "unavailable" ? <Panel title="Custos"><UnavailableState /></Panel> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Por provedor" description="Valores mensais fictícios; qualidade da fonte indicada por linha." actions={<StatusBadge status="estimate" />}>
            <ResourceTable<ProviderCostAllocation> rows={providers} getId={(provider) => provider.provider} csvName="custos-provedores"
              searchKeys={(provider) => `${provider.provider} ${provider.quality}`} statusKey={(provider) => provider.quality}
              statusOptions={["estimativa", "medido"]} emptyText="Nenhum custo corresponde à busca ou qualidade selecionada."
              columns={[
                { key: "provider", header: "Provedor", cell: (provider) => provider.provider, sort: (provider) => provider.provider, exportValue: (provider) => provider.provider },
                { key: "value", header: "Estimativa mensal", cell: (provider) => brl(provider.amountMinor), sort: (provider) => provider.amountMinor, exportValue: (provider) => brl(provider.amountMinor) },
                { key: "quality", header: "Qualidade", cell: (provider) => <StatusBadge status={provider.quality === "estimativa" ? "estimate" : "demo"} />, sort: (provider) => provider.quality, exportValue: (provider) => provider.quality },
              ]} />
            <div className="mt-4 border-t pt-3 text-sm"><div className="flex justify-between font-semibold"><span>Total estimado vs. orçamento</span><span className="tnum">{brl(total)} / {brl(budget)}</span></div><Progress value={(total / budget) * 100} className="mt-1 h-2" /></div>
            <p className="mt-3 rounded-md bg-warning-soft p-2 text-xs text-warning">Anomalia (DEMO): Neon +18% vs. semana anterior.</p>
          </Panel>
          <Panel title="Custo estimado por escritório" actions={<StatusBadge status="estimate" />}>
            <ResourceTable<TenantSummary> rows={tenants} getId={(tenant) => tenant.id} csvName="rateio-estimado-escritorios" pageSize={8}
              searchKeys={(tenant) => `${tenant.displayName} ${tenant.id} ${tenant.city}`} statusKey={(tenant) => tenant.status}
              statusOptions={["ativo", "trial", "inadimplente", "suspenso", "cancelado"]}
              columns={[
                { key: "tenant", header: "Escritório", cell: (tenant) => tenant.displayName, sort: (tenant) => tenant.displayName, exportValue: (tenant) => tenant.displayName },
                { key: "storage", header: "Uso (GB)", cell: (tenant) => tenant.storageGb, sort: (tenant) => tenant.storageGb, exportValue: (tenant) => tenant.storageGb },
                { key: "seats", header: "Assentos", cell: (tenant) => `${tenant.activeSeats} / ${tenant.seatLimit}`, sort: (tenant) => tenant.activeSeats, exportValue: (tenant) => `${tenant.activeSeats} / ${tenant.seatLimit}` },
                { key: "cost", header: "Rateio estimado", cell: (tenant) => brl(tenant.storageGb * 45 + tenant.activeSeats * 120), sort: (tenant) => tenant.storageGb * 45 + tenant.activeSeats * 120, exportValue: (tenant) => brl(tenant.storageGb * 45 + tenant.activeSeats * 120) },
              ]} />
            <p className="mt-2 text-xs text-muted-foreground">Rateio proporcional de recurso compartilhado — não é valor medido.</p>
          </Panel>
        </div>
      )}
    </InfraPage>
  );
}
