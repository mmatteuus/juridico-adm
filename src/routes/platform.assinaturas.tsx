import { createFileRoute, Link } from "@tanstack/react-router";
import { KpiGrid, MetricCard, PageHeader, PageSkeleton, Panel, ActivityTimeline, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { brl, financeTotals, fmtDate, fmtDateTime, useDemo } from "@/features/demo/store";
import type { SubscriptionSummary } from "@/features/demo/types";

export const Route = createFileRoute("/platform/assinaturas")({
  head: () => ({ meta: [{ title: "Assinaturas — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: Assinaturas,
});

function Assinaturas() {
  const loading = useFakeLoading();
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;
  const fin = financeTotals(s);
  const name = (id: string) => s.tenants.find((t) => t.id === id)?.displayName ?? id;
  const plan = (id: string) => { const p = s.plans.find((x) => x.id === id); return p ? `${p.name} v${p.version}` : id; };
  return (
    <>
      <PageHeader title="Assinaturas SaaS" description="Upgrades e downgrades são feitos na ficha do escritório e refletem aqui e no histórico." />
      <KpiGrid>
        <MetricCard label="MRR contratual" value={brl(fin.mrr)} hint="Métrica recorrente, não recebimento" />
        <MetricCard label="ARR contratual" value={brl(fin.arr)} />
        <MetricCard label="Em regularização" value={s.subscriptions.filter((x) => x.status === "regularizacao").length} />
        <MetricCard label="Trials" value={s.subscriptions.filter((x) => x.status === "trial").length} />
      </KpiGrid>
      <div className="mt-4">
        <ResourceTable<SubscriptionSummary> rows={s.subscriptions} getId={(x) => x.tenantId} csvName="assinaturas" rowLink={(x) => `/platform/escritorios/${x.tenantId}`}
          searchKeys={(x) => `${name(x.tenantId)} ${x.planId}`} statusKey={(x) => x.status} statusOptions={["ativa", "trial", "regularizacao", "suspensa", "cancelada"]}
          columns={[
            { key: "t", header: "Escritório", cell: (x) => name(x.tenantId), sort: (x) => name(x.tenantId) },
            { key: "p", header: "Plano", cell: (x) => plan(x.planId), sort: (x) => x.planId },
            { key: "s", header: "Status", cell: (x) => <StatusBadge status={x.status} />, sort: (x) => x.status },
            { key: "c", header: "Ciclo", cell: (x) => x.billingCycle, sort: (x) => x.billingCycle },
            { key: "m", header: "MRR", cell: (x) => brl(x.mrrMinor), sort: (x) => x.mrrMinor },
            { key: "n", header: "Próx. fatura", cell: (x) => fmtDate(x.nextInvoiceDate), sort: (x) => x.nextInvoiceDate, mobileHidden: true },
          ]} />
      </div>
      <Panel title="Histórico de mudanças de plano" className="mt-4">
        {s.planHistory.length ? <ActivityTimeline items={s.planHistory.map((h, i) => ({ id: String(i), when: fmtDateTime(h.when), title: `${name(h.tenantId)}: ${h.from} → ${h.to}`, meta: h.reason }))} /> : <p className="text-sm text-muted-foreground">Nenhuma mudança simulada ainda. <Link to="/platform/escritorios" className="text-primary">Abra um escritório</Link> para simular.</p>}
      </Panel>
    </>
  );
}
