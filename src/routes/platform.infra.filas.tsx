import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { InfraPage } from "@/components/admin/InfraPage";
import { Panel, ResourceTable, StatusBadge, UnavailableState } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { actions, useDemo } from "@/features/demo/store";
import type { QueueJob } from "@/features/demo/types";

export const Route = createFileRoute("/platform/infra/filas")({
  head: () => ({ meta: [
    { title: "Filas e jobs — JURIDO SuperAdmin" },
    { name: "description", content: "Filas, jobs e reprocessamento demonstrativo da plataforma JURIDO." },
    { property: "og:title", content: "Filas e jobs — JURIDO SuperAdmin" },
    { property: "og:description", content: "Filas, jobs e reprocessamento demonstrativo da plataforma JURIDO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Filas,
});

function Filas() {
  const queues = useDemo((s) => s.queueJobs);
  return (
    <InfraPage title="Filas, jobs e containers" description="Processamento assíncrono, retries e DLQ." source="Cloudflare Queues/Containers (não conectado)"
      metrics={[
        { key: "queue", label: "Mensagens processadas", unit: "msg", agg: "sum" },
        { key: "retries", label: "Retries", unit: "tentativas", agg: "sum", type: "bar" },
        { key: "dlq", label: "Entradas na DLQ", unit: "msg", agg: "sum", type: "bar" },
        { key: "latency", label: "Tempo médio de processamento", unit: "ms", type: "line" },
      ]}>
      {({ status }) => (
        <Panel title="Filas e workers" description="Profundidade, idade da mensagem mais antiga, retentativas e DLQ (fixture local).">
          {status === "unavailable" ? <UnavailableState /> : (
            <ResourceTable<QueueJob> rows={queues} getId={(queue) => queue.name} csvName="filas-jobs"
              searchKeys={(queue) => `${queue.name} ${queue.worker} ${queue.status}`}
              statusKey={(queue) => queue.status} statusOptions={["saudavel", "degradado"]}
              emptyText="Nenhuma fila corresponde à busca ou status selecionado."
              columns={[
                { key: "name", header: "Fila", cell: (queue) => queue.name, sort: (queue) => queue.name, exportValue: (queue) => queue.name },
                { key: "worker", header: "Worker/container", cell: (queue) => queue.worker, sort: (queue) => queue.worker, exportValue: (queue) => queue.worker, mobileHidden: true },
                { key: "depth", header: "Profundidade", cell: (queue) => queue.depth, sort: (queue) => queue.depth, exportValue: (queue) => queue.depth },
                { key: "age", header: "Mais antiga (min)", cell: (queue) => queue.oldestAgeMinutes, sort: (queue) => queue.oldestAgeMinutes, exportValue: (queue) => queue.oldestAgeMinutes, mobileHidden: true },
                { key: "retries", header: "Retries", cell: (queue) => queue.retries, sort: (queue) => queue.retries, exportValue: (queue) => queue.retries, mobileHidden: true },
                { key: "avg", header: "Tempo médio", cell: (queue) => queue.averageProcessingMs >= 1000 ? `${(queue.averageProcessingMs / 1000).toLocaleString("pt-BR")} s` : `${queue.averageProcessingMs} ms`, sort: (queue) => queue.averageProcessingMs, exportValue: (queue) => queue.averageProcessingMs },
                { key: "dlq", header: "DLQ", cell: (queue) => queue.deadLetterCount, sort: (queue) => queue.deadLetterCount, exportValue: (queue) => queue.deadLetterCount },
                { key: "status", header: "Status", cell: (queue) => <StatusBadge status={queue.status} />, sort: (queue) => queue.status, exportValue: (queue) => queue.status },
                { key: "action", header: "Ação", cell: (queue) => <Button size="sm" variant="outline" className="whitespace-nowrap" disabled={queue.deadLetterCount === 0} onClick={() => { actions.reprocessQueue(queue.name); toast.success(`Reprocessamento simulado de ${queue.name} — nada foi executado`); }}>Reprocessar DLQ</Button> },
              ]} />
          )}
        </Panel>
      )}
    </InfraPage>
  );
}
