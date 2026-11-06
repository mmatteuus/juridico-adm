import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageSkeleton, KpiGrid, MetricCard, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { brl, fmtDate, useDemo } from "@/features/demo/store";
import { Reseller } from "@/features/demo/types";

export const Route = createFileRoute("/platform/revendedores")({
  head: () => ({ meta: [
    { title: "Revendedores — JURIDO SuperAdmin" },
    { name: "description", content: "Lista de parceiros revendedores, com comissão e escritórios atribuídos" },
    { property: "og:title", content: "Revendedores — JURIDO SuperAdmin" },
    { property: "og:description", content: "Lista de parceiros revendedores, com comissão e escritórios atribuídos" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Revendedores,
});

function Revendedores() {
  const loading = useFakeLoading();
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;

  const totalCommission = s.commissions.reduce((a, c) => a + c.amountMinor, 0);

  return (
    <>
      <PageHeader title="Revendedores" description="Parceiros, comissões e escritórios atribuídos" />
      <KpiGrid>
        <MetricCard label="Revendedores" value={s.resellers.length} />
        <MetricCard label="Comissão total" value={brl(totalCommission)} />
      </KpiGrid>
      <div className="mt-4">
        <ResourceTable<Reseller>
          rows={s.resellers}
          getId={(r) => r.id}
          csvName="revendedores"
          rowLink={(r) => `/platform/revendedores/${r.id}`}
          searchKeys={(r) => `${r.name} ${r.type}`}
          statusKey={(r) => r.status}
          statusOptions={["em_analise", "ativo", "cancelado"]}
          columns={[
            { key: "n", header: "Nome", cell: (r) => r.name, sort: (r) => r.name },
            { key: "t", header: "Tipo", cell: (r) => r.type, sort: (r) => r.type },
            { key: "r", header: "Região", cell: (r) => r.region, sort: (r) => r.region },
            { key: "s", header: "Status", cell: (r) => <StatusBadge status={r.status} />, sort: (r) => r.status },
            { key: "c", header: "Comissão", cell: (r) => {
              const cm = s.commissions.filter((c) => c.resellerId === r.id);
              return brl(cm.reduce((a, c) => a + c.amountMinor, 0));
            }, sort: (r) => s.commissions.filter((c) => c.resellerId === r.id).reduce((a, c) => a + c.amountMinor, 0) },
          ]}
        />
      </div>
    </>
  );
}
