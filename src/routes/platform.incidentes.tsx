import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ActivityTimeline, KpiGrid, MetricCard, PageHeader, PageSkeleton, Panel, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { actions, fmtDateTime, useDemo } from "@/features/demo/store";

export const Route = createFileRoute("/platform/incidentes")({
  head: () => ({ meta: [{ title: "Incidentes — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: Incidentes,
});

const RUNBOOK = ["Confirmar alerta e severidade", "Abrir canal do incidente e nomear responsável", "Mitigar (rollback, cache, escala)", "Comunicar status interno", "Monitorar e registrar pós-mortem"];

function Incidentes() {
  const loading = useFakeLoading();
  const incidents = useDemo((s) => s.incidents);
  if (loading) return <PageSkeleton />;
  return (
    <>
      <PageHeader title="Incidentes e status" description="Linha do tempo, severidade, serviço afetado e runbook — modo DEMO." />
      <KpiGrid>
        <MetricCard label="Abertos" value={incidents.filter((i) => i.status !== "resolvido").length} />
        <MetricCard label="SEV1 (90 dias)" value={incidents.filter((i) => i.severity === "SEV1").length} />
        <MetricCard label="Resolvidos" value={incidents.filter((i) => i.status === "resolvido").length} />
        <MetricCard label="MTTR (demo)" value="2h 40m" />
      </KpiGrid>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {incidents.map((i) => (
            <Panel key={i.id} title={`${i.id} — ${i.title}`} description={`${i.service} · início ${fmtDateTime(i.startedAt)}`} actions={<div className="flex gap-2"><StatusBadge status={i.severity} /><StatusBadge status={i.status} /></div>}>
              <ActivityTimeline items={i.timeline.map((t, k) => ({ id: String(k), when: fmtDateTime(t.when), title: t.text }))} />
              {i.status !== "resolvido" && <Button size="sm" variant="outline" className="mt-3" onClick={() => { actions.advanceIncident(i.id); toast.success("Andamento atualizado (DEMO)"); }}>Avançar status</Button>}
            </Panel>
          ))}
        </div>
        <Panel title="Runbook padrão"><ol className="list-decimal space-y-2 pl-4 text-sm">{RUNBOOK.map((r) => <li key={r}>{r}</li>)}</ol></Panel>
      </div>
    </>
  );
}
