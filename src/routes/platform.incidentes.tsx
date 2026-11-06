import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ActivityTimeline, KpiGrid, MetricCard, PageHeader, PageSkeleton, Panel, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { matchesSearch } from "@/features/demo/table";
import { actions, fmtDateTime, useDemo } from "@/features/demo/store";

export const Route = createFileRoute("/platform/incidentes")({
  head: () => ({ meta: [
    { title: "Incidentes — JURIDO SuperAdmin" },
    { name: "description", content: "Incidentes, severidade e acompanhamento operacional do JURIDO em demonstração." },
    { property: "og:title", content: "Incidentes — JURIDO SuperAdmin" },
    { property: "og:description", content: "Incidentes, severidade e acompanhamento operacional do JURIDO em demonstração." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Incidentes,
});

const RUNBOOK = ["Confirmar alerta e severidade", "Abrir canal do incidente e nomear responsável", "Mitigar (rollback, cache, escala)", "Comunicar status interno", "Monitorar e registrar pós-mortem"];

function Incidentes() {
  const loading = useFakeLoading();
  const incidents = useDemo((s) => s.incidents);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("todas");
  const [status, setStatus] = useState("todos");
  if (loading) return <PageSkeleton />;
  const filteredIncidents = incidents.filter((i) =>
    matchesSearch(`${i.id} ${i.title} ${i.service} ${i.status} ${i.severity}`, query)
      && (severity === "todas" || i.severity === severity)
      && (status === "todos" || i.status === status),
  );
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return (
    <>
      <PageHeader title="Incidentes e status" description="Linha do tempo, severidade, serviço afetado e runbook — modo DEMO." />
      <KpiGrid>
        <MetricCard label="Abertos" value={incidents.filter((i) => i.status !== "resolvido").length} />
        <MetricCard label="SEV1 (90 dias)" value={incidents.filter((i) => i.severity === "SEV1" && new Date(i.startedAt).getTime() >= ninetyDaysAgo).length} />
        <MetricCard label="Resolvidos" value={incidents.filter((i) => i.status === "resolvido").length} />
        <MetricCard label="MTTR (demo)" value="2h 40m" />
      </KpiGrid>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Filtrar incidentes" description={`${filteredIncidents.length} de ${incidents.length} incidentes demonstrativos`}>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
              <Input type="search" aria-label="Buscar incidentes" placeholder="ID, serviço ou descrição" value={query} onChange={(e) => setQuery(e.target.value)} />
              <select aria-label="Filtrar por severidade" className="h-9 rounded-md border bg-background px-2 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="todas">Todas as severidades</option><option value="SEV1">SEV1</option><option value="SEV2">SEV2</option><option value="SEV3">SEV3</option>
              </select>
              <select aria-label="Filtrar por status" className="h-9 rounded-md border bg-background px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="todos">Todos os status</option><option value="investigando">Investigando</option><option value="mitigado">Mitigado</option><option value="monitorando">Monitorando</option><option value="resolvido">Resolvido</option>
              </select>
              {(query || severity !== "todas" || status !== "todos") && <Button variant="outline" onClick={() => { setQuery(""); setSeverity("todas"); setStatus("todos"); }}>Limpar</Button>}
            </div>
          </Panel>
          {filteredIncidents.length === 0 ? <Panel title="Nenhum incidente encontrado"><p className="text-sm text-muted-foreground">Ajuste os filtros para ver incidentes demonstrativos.</p></Panel> : filteredIncidents.map((i) => (
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
