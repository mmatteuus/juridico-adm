import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageSkeleton, KpiGrid, MetricCard, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { brl, fmtDate, useDemo } from "@/features/demo/store";
import { PlanVersion } from "@/features/demo/types";

export const Route = createFileRoute("/platform/planos")({
  head: () => ({ meta: [
    { title: "Planos — JURIDO SuperAdmin" },
    { name: "description", content: "Lista de planos SaaS, detalhes de limite e status" },
    { property: "og:title", content: "Planos — JURIDO SuperAdmin" },
    { property: "og:description", content: "Lista de planos SaaS, detalhes de limite e status" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Planos,
});

function Planos() {
  const loading = useFakeLoading();
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;
  const activePlans = s.plans.filter((p) => p.status === "ativo");

  return (
    <>
      <PageHeader title="Planos" description="Planos SaaS disponíveis, limites por plano e status" />
      <KpiGrid>
        <MetricCard label="Planos ativos" value={activePlans.length} />
        <MetricCard label="Planos total" value={s.plans.length} />
        <MetricCard label="Assentos totais" value={s.plans.reduce((a, p) => a + (p.seatLimit ?? 0), 0)} />
        <MetricCard label="Armazenamento total" value={s.plans.reduce((a, p) => a + (p.storageCapGb ?? 0), 0) + " GB"} />
      </KpiGrid>
      <div className="mt-4">
        <ResourceTable<PlanVersion>
          rows={s.plans}
          getId={(p) => p.id}
          csvName="planos"
          rowLink={(p) => `/platform/planos/${p.id}`}
          searchKeys={(p) => `${p.name} ${p.version}`}
          statusKey={(p) => p.status}
          statusOptions={["ativo", "rascunho", "descontinuado"]}
          columns={[
            { key: "n", header: "Nome", cell: (p) => p.name, sort: (p) => p.name },
            { key: "v", header: "Versão", cell: (p) => `v${p.version}`, sort: (p) => p.version },
            { key: "s", header: "Status", cell: (p) => <StatusBadge status={p.status} />, sort: (p) => p.status },
            { key: "se", header: "Assentos", cell: (p) => p.seatLimit ?? "—", sort: (p) => p.seatLimit ?? 0 },
            { key: "st", header: "Armaz.", cell: (p) => p.storageCapGb ? `${p.storageCapGb} GB` : "—", sort: (p) => p.storageCapGb ?? 0 },
            { key: "api", header: "Calls/mês", cell: (p) => p.apiCallsMonth ? p.apiCallsMonth.toLocaleString("pt-BR") : "—", sort: (p) => p.apiCallsMonth ?? 0 },
            { key: "prc", header: "Preço MRR", cell: (p) => brl(p.mrrMonthlyMinor ?? 0), sort: (p) => p.mrrMonthlyMinor ?? 0 },
            { key: "eff", header: "Vigência", cell: (p) => fmtDate(p.effectiveFrom), sort: (p) => p.effectiveFrom },
          ]}
        />
      </div>
    </>
  );
}
