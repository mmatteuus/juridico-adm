import { createFileRoute } from "@tanstack/react-router";
import { InfraPage } from "@/components/admin/InfraPage";
import { Panel, StatusBadge, UnavailableState } from "@/components/admin/kit";

export const Route = createFileRoute("/platform/infra/banco")({
  head: () => ({ meta: [{ title: "Banco (Neon) — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <InfraPage title="Observabilidade do banco (Neon)" description="Métricas do projeto Neon compartilhado. Valores por escritório são apenas estimativas." source="Neon PostgreSQL (não conectado)"
      metrics={[
        { key: "cpu", label: "Compute (CPU)", unit: "%", type: "line" },
        { key: "storage", label: "Armazenamento", unit: "GB", agg: "last" },
        { key: "connections", label: "Conexões ativas", unit: "conn", type: "line" },
        { key: "locks", label: "Locks em espera", unit: "locks", type: "bar" },
        { key: "queries", label: "Consultas por minuto", unit: "q/min" },
        { key: "latency", label: "Latência de consulta p95", unit: "ms", type: "line" },
      ]}>
      {({ status }) => (
        <Panel title="Projeto vs. tenant" description="Consumo medido é do projeto; por escritório é estimativa proporcional.">
          {status === "unavailable" ? <UnavailableState /> : (
            <ul className="divide-y text-sm">
              <li className="flex justify-between py-2"><span>Projeto jurido-prod (compartilhado)</span><StatusBadge status={status === "partial" ? "partial" : "demo"} /></li>
              <li className="flex justify-between py-2"><span>Custo/armazenamento por escritório</span><StatusBadge status="estimate" /></li>
            </ul>
          )}
          <p className="mt-2 text-xs text-muted-foreground">O SuperAdmin nunca abre console SQL ou dados de escritórios.</p>
        </Panel>
      )}
    </InfraPage>
  ),
});
