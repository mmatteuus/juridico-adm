import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageSkeleton, KpiGrid, MetricCard, ResourceTable, StatusBadge, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label } from "@/components/admin/kit";
import { useDemo, actions, fmtDate } from "@/features/demo/store";
import { Domain } from "@/features/demo/types";

export const Route = createFileRoute("/platform/infra/dominios")({
  head: () => ({ meta: [
    { title: "Domínios — JURIDO SuperAdmin" },
    { name: "description", content: "Domínios customizados por escritório, status de verificação e data de criação." },
    { property: "og:title", content: "Domínios — JURIDO SuperAdmin" },
    { property: "og:description", content: "Domínios customizados por escritório, status de verificação e data de criação." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Dominios,
});

function Dominios() {
  const loading = useDemo((s) => s);
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;

  const [open, setOpen] = React.useState(false);
  const [domain, setDomain] = React.useState("");
  const [tenantId, setTenantId] = React.useState("");

  const submit = () => {
    // Simulate adding a domain (demo only)
    const id = `dm-${Date.now()}`;
    actions.createDomain?.(id, domain, tenantId, "pending"); // placeholder action – adjust if needed
    setOpen(false);
  };

  return (
    <>
      <PageHeader title="Domínios" description="Domínios customizados por escritório e seu status de verificação." />
      <KpiGrid>
        <MetricCard label="Domínios" value={s.domains?.length ?? 0} />
        <MetricCard label="Pendentes" value={s.domains?.filter((d) => d.status === "pending").length ?? 0} />
      </KpiGrid>
      <div className="mt-4">
        <ResourceTable<Domain>
          rows={s.domains ?? []}
          getId={(d) => d.id}
          csvName="dominios"
          rowLink={(d) => `/platform/infra/dominios/${d.id}`}
          searchKeys={(d) => `${d.domain} ${d.tenantId}`}
          statusKey={(d) => d.status}
          statusOptions={["verified", "pending", "failed"]}
          columns={[
            { key: "d", header: "Domínio", cell: (d) => d.domain, sort: (d) => d.domain },
            { key: "t", header: "Escritório", cell: (d) => s.tenants.find((t) => t.id === d.tenantId)?.displayName ?? d.tenantId, sort: (d) => d.tenantId },
            { key: "s", header: "Status", cell: (d) => <StatusBadge status={d.status} />, sort: (d) => d.status },
            { key: "c", header: "Criado", cell: (d) => fmtDate(d.createdAt), sort: (d) => d.createdAt },
          ]}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-2">Adicionar domínio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar domínio</DialogTitle>
              <DialogDescription>Informe o domínio completo e o escritório ao qual será associado.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="domain">Domínio</Label>
                <Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="exemplo.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tenant">Escritório</Label>
                <select id="tenant" value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
                  {s.tenants.map((t) => <option key={t.id} value={t.id}>{t.displayName}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
