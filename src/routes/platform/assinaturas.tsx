import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageSkeleton, KpiGrid, MetricCard, ResourceTable, StatusBadge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/admin/kit";
import { brl, fmtDate, fmtDateTime, useDemo, actions } from "@/features/demo/store";
import { SubscriptionSummary, PlanVersion } from "@/features/demo/types";
import { toast } from "sonner";

export const Route = createFileRoute("/platform/assinaturas")({
  head: () => ({ meta: [
    { title: "Assinaturas — JURIDO SuperAdmin" },
    { name: "description", content: "Assinaturas, MRR e histórico de mudanças de plano." },
    { property: "og:title", content: "Assinaturas — JURIDO SuperAdmin" },
    { property: "og:description", content: "Assinaturas, MRR e histórico de mudanças de plano." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Assinaturas,
});

function Assinaturas() {
  const loading = useDemo((s) => s); // trigger fake loading
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;

  const fin = (s.subscriptions.reduce((a, sub) => a + sub.mrrMinor, 0));
  const name = (id: string) => s.tenants.find((t) => t.id === id)?.displayName ?? id;
  const plan = (id: string) => {
    const p = s.plans.find((p) => p.id === id);
    return p ? `${p.name} v${p.version}` : id;
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTenant, setSelectedTenant] = React.useState<string>(s.subscriptions[0]?.tenantId ?? "");
  const [newPlan, setNewPlan] = React.useState<string>(s.subscriptions[0]?.planId ?? "");

  const submit = () => {
    actions.changePlan(selectedTenant, newPlan, "Alteração via UI (DEMO)");
    toast.success("Plano alterado (DEMO)");
    setDialogOpen(false);
  };

  return (
    <>
      <PageHeader title="Assinaturas SaaS" description="Gestão de assinaturas e MRR." />
      <KpiGrid>
        <MetricCard label="MRR contratual" value={brl(fin)} hint="Métrica recorrente, não recebimento" />
        <MetricCard label="Assinaturas ativas" value={s.subscriptions.filter((x) => x.status === "ativa").length} />
        <MetricCard label="Trials" value={s.subscriptions.filter((x) => x.status === "trial").length} />
        <MetricCard label="Em regularização" value={s.subscriptions.filter((x) => x.status === "regularizacao").length} />
      </KpiGrid>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Alterar plano</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar plano da assinatura</DialogTitle>
            <DialogDescription>Selecione o escritório e o novo plano.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger>
                <SelectValue placeholder="Escritório" />
              </SelectTrigger>
              <SelectContent>
                {s.subscriptions.map((sub) => (
                  <SelectItem key={sub.tenantId} value={sub.tenantId}>{name(sub.tenantId)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newPlan} onValueChange={setNewPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Novo plano" />
              </SelectTrigger>
              <SelectContent>
                {s.plans.filter((p) => p.status === "ativo").map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} v{p.version}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={submit}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResourceTable<SubscriptionSummary>
        rows={s.subscriptions}
        getId={(x) => x.tenantId}
        csvName="assinaturas"
        rowLink={(x) => `/platform/escritorios/${x.tenantId}`}
        searchKeys={(x) => `${name(x.tenantId)} ${x.planId}`}
        statusKey={(x) => x.status}
        statusOptions={["ativa", "trial", "regularizacao", "suspensa", "cancelada"]}
        columns={[
          { key: "t", header: "Escritório", cell: (x) => name(x.tenantId), sort: (x) => name(x.tenantId) },
          { key: "p", header: "Plano", cell: (x) => plan(x.planId), sort: (x) => x.planId },
          { key: "s", header: "Status", cell: (x) => <StatusBadge status={x.status} />, sort: (x) => x.status },
          { key: "c", header: "Ciclo", cell: (x) => x.billingCycle, sort: (x) => x.billingCycle },
          { key: "m", header: "MRR", cell: (x) => brl(x.mrrMinor), sort: (x) => x.mrrMinor },
          { key: "n", header: "Próx. fatura", cell: (x) => fmtDate(x.nextInvoiceDate), sort: (x) => x.nextInvoiceDate, mobileHidden: true },
        ]}
      />
    </>
  );
}
