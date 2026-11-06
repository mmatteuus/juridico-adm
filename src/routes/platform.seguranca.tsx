import { createFileRoute } from "@tanstack/react-router";
import { KpiGrid, MetricCard, PageHeader, PageSkeleton, Panel, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { fmtDateTime, useDemo } from "@/features/demo/store";
import { ROLES } from "@/features/demo/roles";
import type { AuditEvent } from "@/features/demo/types";

export const Route = createFileRoute("/platform/seguranca")({
  head: () => ({ meta: [
    { title: "Segurança e governança — JURIDO SuperAdmin" },
    { name: "description", content: "Trilha de auditoria, resultados de ações e governança de acesso do JURIDO SuperAdmin." },
    { property: "og:title", content: "Segurança e governança — JURIDO SuperAdmin" },
    { property: "og:description", content: "Trilha de auditoria, resultados de ações e governança de acesso do JURIDO SuperAdmin." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Seguranca,
});

function Seguranca() {
  const loading = useFakeLoading();
  const audit = useDemo((s) => s.audit);
  if (loading) return <PageSkeleton />;
  const denied = audit.filter((event) => event.outcome === "negado").length;
  const simulated = audit.filter((event) => event.outcome === "simulado").length;
  return (
    <>
      <PageHeader title="Segurança e governança" description="Trilha demonstrativa das ações administrativas e seus resultados. O controle de contas da equipe fica em Contas." />
      <KpiGrid>
        <MetricCard label="Eventos de auditoria" value={audit.length} />
        <MetricCard label="Ações negadas" value={denied} />
        <MetricCard label="Ações simuladas" value={simulated} hint="Demonstração local; sem efeito em serviços reais" />
      </KpiGrid>
      <Panel title="Break-glass (documentado)" className="mt-4">
        <p className="text-sm text-muted-foreground">Acesso emergencial exigirá dois aprovadores, MFA reforçado, janela de tempo limitada e registro completo. Nunca concede leitura de documentos jurídicos. Fluxo [PENDENTE] para produção.</p>
      </Panel>
      <div className="mt-4" aria-label="Eventos de auditoria">
        <ResourceTable<AuditEvent> rows={audit} getId={(a) => a.id} csvName="auditoria" searchKeys={(a) => `${a.action} ${a.objectId} ${a.reason ?? ""}`} statusKey={(a) => a.actorRole} statusOptions={Object.keys(ROLES)}
          columns={[
            { key: "w", header: "Quando", cell: (a) => fmtDateTime(a.when), sort: (a) => a.when },
            { key: "ac", header: "Ação", cell: (a) => <code className="text-xs">{a.action}</code>, sort: (a) => a.action },
            { key: "o", header: "Objeto", cell: (a) => `${a.objectType}:${a.objectId}`, sort: (a) => a.objectId },
            { key: "r", header: "Perfil", cell: (a) => ROLES[a.actorRole], sort: (a) => a.actorRole, mobileHidden: true },
            { key: "out", header: "Resultado", cell: (a) => <StatusBadge status={a.outcome} tone="warning" />, sort: (a) => a.outcome },
            { key: "j", header: "Justificativa", cell: (a) => a.reason ?? "—", exportValue: (a) => a.reason ?? "", mobileHidden: true },
          ]} />
      </div>
    </>
  );
}
