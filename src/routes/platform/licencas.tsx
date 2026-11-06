import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageSkeleton, KpiGrid, MetricCard, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { brl, fmtDate, useDemo } from "@/features/demo/store";
import { EntitlementGrant } from "@/features/demo/types";

export const Route = createFileRoute("/platform/licencas")({
  head: () => ({ meta: [
    { title: "Licenças — JURIDO SuperAdmin" },
    { name: "description", content: "Gerenciamento de assentos e add‑ons por escritório" },
    { property: "og:title", content: "Licenças — JURIDO SuperAdmin" },
    { property: "og:description", content: "Gerenciamento de assentos e add‑ons por escritório" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Licencas,
});

function Licencas() {
  const loading = useFakeLoading();
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;

  const activeEntitlements = s.entitlements.filter((e) => e.active);

  return (
    <>
      <PageHeader title="Licenças" description="Assentos ativos e add‑ons por escritório" />
      <KpiGrid>
        <MetricCard label="Entitlements ativos" value={activeEntitlements.length} />
        <MetricCard label="Add‑ons ativos" value={activeEntitlements.filter((e) => e.mode === "addon").length} />
      </KpiGrid>
      <div className="mt-4">
        <ResourceTable<EntitlementGrant>
          rows={s.entitlements}
          getId={(e) => e.id}
          csvName="licencas"
          rowLink={(e) => `/platform/escritorios/${e.tenantId}`}
          searchKeys={(e) => `${e.featureKey} ${e.tenantId}`}
          statusKey={(e) => e.active ? "ativo" : "revogado"}
          statusOptions={["ativo", "revogado"]}
          columns={[
            { key: "t", header: "Escritório", cell: (e) => s.tenants.find((t) => t.id === e.tenantId)?.displayName ?? e.tenantId, sort: (e) => e.tenantId },
            { key: "f", header: "Recurso", cell: (e) => e.featureKey, sort: (e) => e.featureKey },
            { key: "m", header: "Modo", cell: (e) => e.mode, sort: (e) => e.mode },
            { key: "v", header: "Válido até", cell: (e) => e.validUntil ? fmtDate(e.validUntil) : "—", sort: (e) => e.validUntil ?? "" },
            { key: "s", header: "Status", cell: (e) => <StatusBadge status={e.active ? "ativo" : "revogado"} />, sort: (e) => e.active ? "ativo" : "revogado" },
          ]}
        />
      </div>
    </>
  );
}
