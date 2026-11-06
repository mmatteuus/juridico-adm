import { createFileRoute } from "@tanstack/react-router";
import { InfraPage } from "@/components/admin/InfraPage";
import { Panel, ResourceTable, StatusBadge, UnavailableState } from "@/components/admin/kit";
import { useDemo } from "@/features/demo/store";
import type { DomainHealth } from "@/features/demo/types";

export const Route = createFileRoute("/platform/infra/dominios")({
  head: () => ({ meta: [
    { title: "Domínios — JURIDO SuperAdmin" },
    { name: "description", content: "Domínios, TLS e segurança de borda demonstrativos da plataforma JURIDO." },
    { property: "og:title", content: "Domínios — JURIDO SuperAdmin" },
    { property: "og:description", content: "Domínios, TLS e segurança de borda demonstrativos da plataforma JURIDO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Domains,
});

function Domains() {
  const hosts = useDemo((s) => s.domainHealth);
  return (
    <InfraPage title="Domínios e segurança de borda" description="Hostnames, TLS, tráfego e WAF. Nenhum status aqui é verificação real." source="Cloudflare DNS/WAF (não conectado)" withApp
      metrics={[
        { key: "traffic", label: "Tráfego total", unit: "GB", agg: "sum" },
        { key: "requests", label: "Requisições na borda", unit: "req", agg: "sum" },
        { key: "errors4xx", label: "Bloqueios WAF", unit: "eventos", agg: "sum", type: "bar" },
        { key: "latency", label: "Handshake TLS", unit: "ms", type: "line" },
      ]}>
      {({ status, app }) => {
        const scopedHosts = hosts.filter((host) => app === "todas" || host.app === app);
        return <Panel title="Hostnames (fictícios)" description="Filtro de app aplicado aos registros demonstrativos.">
          {status === "unavailable" ? <UnavailableState /> : (
            <ResourceTable<DomainHealth> rows={scopedHosts} getId={(host) => host.hostname} csvName="dominios"
              searchKeys={(host) => `${host.hostname} ${host.app} ${host.tlsStatus} ${host.wafStatus}`}
              statusKey={(host) => host.tlsStatus} statusOptions={["demo", "partial"]}
              emptyText="Nenhum hostname corresponde à busca ou status selecionado."
              columns={[
                { key: "hostname", header: "Hostname", cell: (host) => host.hostname, sort: (host) => host.hostname, exportValue: (host) => host.hostname },
                { key: "app", header: "App", cell: (host) => host.app, sort: (host) => host.app, exportValue: (host) => host.app },
                { key: "tls", header: "HTTPS/TLS", cell: (host) => <StatusBadge status={host.tlsStatus} />, sort: (host) => host.tlsStatus, exportValue: (host) => host.tlsStatus },
                { key: "waf", header: "WAF", cell: (host) => <StatusBadge status={host.wafStatus} />, sort: (host) => host.wafStatus, exportValue: (host) => host.wafStatus },
              ]} />
          )}
          <p className="mt-2 text-xs text-muted-foreground">Status de TLS simulado — nunca “verificado”.</p>
        </Panel>;
      }}
    </InfraPage>
  );
}
