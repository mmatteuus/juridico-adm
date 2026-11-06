import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog, KpiGrid, MetricCard, PageHeader, PageSkeleton, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { actions, fmtDate, useDemo } from "@/features/demo/store";
import type { EntitlementGrant } from "@/features/demo/types";

export const Route = createFileRoute("/platform/licencas")({
  head: () => ({ meta: [
    { title: "Licenças — JURIDO SuperAdmin" },
    { name: "description", content: "Licenças, limites de assentos e direitos comerciais dos escritórios JURIDO em demonstração." },
    { property: "og:title", content: "Licenças — JURIDO SuperAdmin" },
    { property: "og:description", content: "Licenças, limites de assentos e direitos comerciais dos escritórios JURIDO em demonstração." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Licencas,
});

function Licencas() {
  const loading = useFakeLoading();
  const ents = useDemo((s) => s.entitlements);
  const tenants = useDemo((s) => s.tenants);
  const [revoke, setRevoke] = useState<EntitlementGrant | null>(null);
  if (loading) return <PageSkeleton />;
  const seats = tenants.reduce((a, t) => a + t.activeSeats, 0);
  const limit = tenants.reduce((a, t) => a + t.seatLimit, 0);
  const name = (id: string) => tenants.find((t) => t.id === id)?.displayName ?? id;
  const today = new Date().toISOString().slice(0, 10);
  const expiresSoon = ents.filter((e) => e.active && e.validUntil && e.validUntil >= today && e.validUntil <= new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)).length;
  const entitlementStatus = (e: EntitlementGrant) => !e.active ? "revogado" : e.validUntil && e.validUntil < today ? "expirada" : "ativo";
  return (
    <>
      <PageHeader title="Licenças e entitlements" description="Direitos comerciais por escritório. Para liberar um add-on, abra a ficha do escritório." />
      <KpiGrid>
        <MetricCard label="Assentos em uso" value={seats} unit={`/ ${limit}`} />
        <MetricCard label="Ocupação" value={Math.round((seats / limit) * 100)} unit="%" />
        <MetricCard label="Overrides/add-ons ativos" value={ents.filter((e) => entitlementStatus(e) === "ativo").length} />
        <MetricCard label="Expiram nos próximos 30 dias" value={expiresSoon} hint="Entitlements ativos com validade definida" />
      </KpiGrid>
      <div className="mt-4">
        <ResourceTable<EntitlementGrant> rows={ents} getId={(e) => e.id} csvName="entitlements" searchKeys={(e) => `${e.featureKey} ${name(e.tenantId)} ${e.reason} ${e.approvedBy} ${e.validUntil ?? "sem validade"}`}
          statusKey={entitlementStatus} statusOptions={["ativo", "expirada", "revogado"]}
          columns={[
            { key: "t", header: "Escritório", cell: (e) => <Link to="/platform/escritorios/$id" params={{ id: e.tenantId }} className="font-medium text-primary hover:underline">{name(e.tenantId)}</Link>, sort: (e) => name(e.tenantId) },
            { key: "f", header: "Recurso", cell: (e) => <code className="text-xs">{e.featureKey}</code>, sort: (e) => e.featureKey },
            { key: "m", header: "Modo", cell: (e) => e.mode, sort: (e) => e.mode },
            { key: "v", header: "Validade", cell: (e) => (e.validUntil ? fmtDate(e.validUntil) : "Indeterminada"), sort: (e) => e.validUntil ?? "" },
            { key: "r", header: "Motivo", cell: (e) => e.reason, sort: (e) => e.reason, mobileHidden: true },
            { key: "s", header: "Status", cell: (e) => <StatusBadge status={entitlementStatus(e)} />, sort: (e) => entitlementStatus(e) },
            { key: "a", header: "Ação", cell: (e) => (entitlementStatus(e) === "ativo" ? <Button size="sm" variant="outline" onClick={() => setRevoke(e)}>Revogar</Button> : "—") },
          ]} />
      </div>
      <ConfirmationDialog open={!!revoke} onOpenChange={(o) => !o && setRevoke(null)} destructive title="Revogar comercialmente" object={`${revoke?.featureKey} · ${revoke ? name(revoke.tenantId) : ""}`} operation="Revogar entitlement" impact="Recurso deixa de estar disponível ao escritório. Dados permanecem intactos." confirmLabel="Revogar" onConfirm={(r) => { actions.revokeEntitlement(revoke!.id, r); toast.success("Entitlement revogado (DEMO)"); }} />
    </>
  );
}
