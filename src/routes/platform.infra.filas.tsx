import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { InfraPage } from "@/components/admin/InfraPage";
import { Panel, StatusBadge, UnavailableState } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";

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
  const [queues, setQueues] = useState([
    { name: "notificacoes", worker: "notify-worker", dlq: 3, avg: "1,2 s", status: "saudavel" },
    { name: "documentos-ocr", worker: "ocr-container", dlq: 7, avg: "14 s", status: "degradado" },
    { name: "faturamento", worker: "billing-worker", dlq: 0, avg: "0,8 s", status: "saudavel" },
    { name: "relatorios", worker: "reports-container", dlq: 1, avg: "32 s", status: "saudavel" },
  ]);
  return (
    <InfraPage title="Filas, jobs e containers" description="Processamento assíncrono, retries e DLQ." source="Cloudflare Queues/Containers (não conectado)"
      metrics={[
        { key: "queue", label: "Mensagens processadas", unit: "msg", agg: "sum" },
        { key: "retries", label: "Retries", unit: "tentativas", agg: "sum", type: "bar" },
        { key: "dlq", label: "Entradas na DLQ", unit: "msg", agg: "sum", type: "bar" },
        { key: "latency", label: "Tempo médio de processamento", unit: "ms", type: "line" },
      ]}>
      {({ status }) => (
        <Panel title="Filas e workers">
          {status === "unavailable" ? <UnavailableState /> : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Fila</th><th>Worker/container</th><th>Tempo médio</th><th>DLQ</th><th>Status</th><th /></tr></thead>
              <tbody>{queues.map((q) => <tr key={q.name} className="border-b last:border-0"><td className="py-2 font-medium">{q.name}</td><td>{q.worker}</td><td className="tnum">{q.avg}</td><td className="tnum">{q.dlq}</td><td><StatusBadge status={q.status} /></td>
                <td className="text-right"><Button size="sm" variant="outline" disabled={q.dlq === 0} onClick={() => { setQueues(queues.map((x) => x.name === q.name ? { ...x, dlq: 0, status: "saudavel" } : x)); toast.success(`Reprocessamento simulado de ${q.name} — nada foi executado`); }}>Reprocessar DLQ</Button></td></tr>)}</tbody></table></div>
          )}
        </Panel>
      )}
    </InfraPage>
  );
}
