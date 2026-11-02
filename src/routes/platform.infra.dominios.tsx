import { createFileRoute } from "@tanstack/react-router";
import { InfraPage } from "@/components/admin/InfraPage";
import { Panel, StatusBadge, UnavailableState } from "@/components/admin/kit";

const HOSTS = [
  { host: "admin.jurido.demo", app: "platform-admin", tls: "demo", waf: "ativo" },
  { host: "app.jurido.demo", app: "office-web", tls: "demo", waf: "ativo" },
  { host: "portal.jurido.demo", app: "client-portal", tls: "partial", waf: "planejado" },
  { host: "api.jurido.demo", app: "api", tls: "demo", waf: "ativo" },
];

export const Route = createFileRoute("/platform/infra/dominios")({
  head: () => ({ meta: [{ title: "Domínios — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <InfraPage title="Domínios e segurança de borda" description="Hostnames, TLS, tráfego e WAF. Nenhum status aqui é verificação real." source="Cloudflare DNS/WAF (não conectado)"
      metrics={[
        { key: "traffic", label: "Tráfego total", unit: "GB", agg: "sum" },
        { key: "requests", label: "Requisições na borda", unit: "req", agg: "sum" },
        { key: "errors4xx", label: "Bloqueios WAF", unit: "eventos", agg: "sum", type: "bar" },
        { key: "latency", label: "Handshake TLS", unit: "ms", type: "line" },
      ]}>
      {({ status }) => (
        <Panel title="Hostnames (fictícios)">
          {status === "unavailable" ? <UnavailableState /> : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Hostname</th><th>App</th><th>HTTPS/TLS</th><th>WAF</th></tr></thead>
              <tbody>{HOSTS.map((h) => <tr key={h.host} className="border-b last:border-0"><td className="py-2 font-medium">{h.host}</td><td>{h.app}</td><td><StatusBadge status={h.tls} /></td><td><StatusBadge status={h.waf} /></td></tr>)}</tbody></table></div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Status de TLS simulado — nunca “verificado”.</p>
        </Panel>
      )}
    </InfraPage>
  ),
});
