import { createFileRoute } from "@tanstack/react-router";
import { InfraPage } from "@/components/admin/InfraPage";

export const Route = createFileRoute("/platform/infra/trafego")({
  head: () => ({ meta: [{ title: "Workers e API — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <InfraPage withApp title="Workers e API" description="Requisições, latência e erros por app e período." source="Cloudflare Workers (não conectado)"
      metrics={[
        { key: "requests", label: "Requisições", unit: "req", agg: "sum" },
        { key: "latency", label: "Latência p95", unit: "ms", type: "line" },
        { key: "errors4xx", label: "Erros 4xx", unit: "req", agg: "sum", type: "bar" },
        { key: "errors5xx", label: "Erros 5xx", unit: "req", agg: "sum", type: "bar" },
        { key: "traffic", label: "Tráfego", unit: "GB", agg: "sum" },
      ]} />
  ),
});
