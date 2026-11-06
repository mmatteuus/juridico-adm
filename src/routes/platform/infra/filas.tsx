import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageSkeleton, KpiGrid, MetricCard, ChartPanel, Panel, useFakeLoading } from "@/components/admin/kit";
import { series, metricStatus } from "@/features/demo/metrics";
import { useDemo } from "@/features/demo/store";

export const Route = createFileRoute("/platform/infra/filas")({
  head: () => ({ meta: [
    { title: "Filas e jobs — JURIDO SuperAdmin" },
    { name: "description", content: "Status das filas Cloudflare, jobs pendentes, DLQ e métricas de processamento." },
    { property: "og:title", content: "Filas e jobs — JURIDO SuperAdmin" },
    { property: "og:description", content: "Status das filas Cloudflare, jobs pendentes, DLQ e métricas de processamento." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Filas,
});

function Filas() {
  const loading = useFakeLoading();
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;
  const status = metricStatus(s.sourceMode);

  const pending = series("queue", "30d");
  const dlq = series("dlq", "30d");
  const retries = series("retries", "30d");

  return (
    <>
      <PageHeader title="Filas e jobs" description="Visão geral das filas de Cloudflare Workers, DLQ e tentativas de reprocessamento." />
      <KpiGrid>
        <MetricCard label="Jobs pendentes" value={pending[pending.length - 1].value} status={status} source="Cloudflare Queue" />
        <MetricCard label="DLQ (dead‑letter)" value={dlq[dlq.length - 1].value} status={status} source="Cloudflare Queue" />
        <MetricCard label="Re‑tentativas" value={retries[retries.length - 1].value} status={status} source="Cloudflare Queue" />
      </KpiGrid>
      <Panel title="Filas ao longo do tempo (30d)" className="mt-4">
        <ChartPanel title="Profundidade da fila" data={pending} unit="jobs" status={status} source="Cloudflare" period="30d" />
        <ChartPanel title="DLQ" data={dlq} unit="jobs" status={status} source="Cloudflare" period="30d" />
        <ChartPanel title="Re‑tentativas" data={retries} unit="jobs" status={status} source="Cloudflare" period="30d" />
      </Panel>
    </>
  );
}
