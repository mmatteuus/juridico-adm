import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageSkeleton, KpiGrid, MetricCard, ResourceTable, StatusBadge, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label } from "@/components/admin/kit";
import { useDemo, actions, fmtDateTime } from "@/features/demo/store";
import { AuditEvent } from "@/features/demo/types";

export const Route = createFileRoute("/platform/seguranca")({
  head: () => ({ meta: [
    { title: "Segurança — JURIDO SuperAdmin" },
    { name: "description", content: "Auditoria, controle de acesso e revisão de eventos de segurança." },
    { property: "og:title", content: "Segurança — JURIDO SuperAdmin" },
    { property: "og:description", content: "Auditoria, controle de acesso e revisão de eventos de segurança." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Seguranca,
});

function Seguranca() {
  const loading = useDemo((s) => s);
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;

  const [tab, setTab] = React.useState("audit");

  return (
    <>
      <PageHeader title="Segurança" description="Auditoria, eventos de segurança e controle de acesso." />
      <KpiGrid>
        <MetricCard label="Eventos auditados" value={s.audit.length} />
        <MetricCard label="Ações críticas" value={s.audit.filter((e) => e.action.includes("delete") || e.action.includes("revoke")).length} />
      </KpiGrid>
      <div className="mt-4">
        <div className="flex space-x-4 mb-4">
          <Button variant={tab === "audit" ? "default" : "outline"} onClick={() => setTab("audit")} >Auditoria</Button>
          <Button variant={tab === "access" ? "default" : "outline"} onClick={() => setTab("access")} >Controle de acesso</Button>
        </div>
        {tab === "audit" && (
          <ResourceTable<AuditEvent>
            rows={s.audit}
            getId={(e) => e.id}
            csvName="audit"
            rowLink={(e) => `/platform/seguranca/${e.id}`}
            searchKeys={(e) => `${e.action} ${e.objectId}`}
            statusKey={(e) => e.outcome}
            statusOptions={["simulado", "falha"]}
            columns={[
              { key: "t", header: "Quando", cell: (e) => fmtDateTime(e.when), sort: (e) => e.when },
              { key: "a", header: "Ação", cell: (e) => e.action, sort: (e) => e.action },
              { key: "o", header: "Objeto", cell: (e) => e.objectId, sort: (e) => e.objectId },
              { key: "r", header: "Resultado", cell: (e) => <StatusBadge status={e.outcome} />, sort: (e) => e.outcome },
            ]}
          />
        )}
        {tab === "access" && (
          <div className="text-sm text-muted-foreground" >
            <p>Esta seção ainda será implementada – aqui você poderá gerenciar permissões de usuários, revogar tokens e auditar acessos críticos.</p>
          </div>
        )}
      </div>
    </>
  );
}
