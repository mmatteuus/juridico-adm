import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PageSkeleton, ResourceTable, StatusBadge, useFakeLoading, DemoDataBadge } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, fmtDate, useDemo } from "@/features/demo/store";
import type { TenantSummary } from "@/features/demo/types";

export const Route = createFileRoute("/platform/escritorios/")({
  head: () => ({ meta: [{ title: "Escritórios — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: Escritorios,
});

function Escritorios() {
  const loading = useFakeLoading();
  const tenants = useDemo((s) => s.tenants);
  const plans = useDemo((s) => s.plans);
  const resellers = useDemo((s) => s.resellers);
  const [open, setOpen] = useState(false);
  if (loading) return <PageSkeleton />;
  const planName = (id: string) => { const p = plans.find((x) => x.id === id); return p ? `${p.name} v${p.version}` : id; };
  return (
    <>
      <PageHeader title="Escritórios" description="Contas SaaS (tenants). Aqui só existem dados comerciais e operacionais — nunca casos, clientes finais ou documentos." actions={<Button onClick={() => setOpen(true)}><Plus /> Novo escritório</Button>} />
      <ResourceTable<TenantSummary>
        rows={tenants} getId={(t) => t.id} csvName="escritorios" rowLink={(t) => `/platform/escritorios/${t.id}`}
        searchKeys={(t) => `${t.displayName} ${t.id} ${t.city}`} statusKey={(t) => t.status} statusOptions={["ativo", "trial", "inadimplente", "suspenso", "cancelado"]}
        columns={[
          { key: "name", header: "Escritório", cell: (t) => t.displayName, sort: (t) => t.displayName },
          { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} />, sort: (t) => t.status },
          { key: "plan", header: "Plano", cell: (t) => planName(t.planId), sort: (t) => t.planId },
          { key: "seats", header: "Assentos", cell: (t) => `${t.activeSeats}/${t.seatLimit}`, sort: (t) => t.activeSeats },
          { key: "storage", header: "Consumo", cell: (t) => `${t.storageGb} GB`, sort: (t) => t.storageGb, mobileHidden: true },
          { key: "am", header: "Resp. comercial", cell: (t) => t.accountManager, sort: (t) => t.accountManager, mobileHidden: true },
          { key: "partner", header: "Parceiro", cell: (t) => resellers.find((r) => r.id === t.sourcePartnerId)?.name ?? "Direto", sort: (t) => t.sourcePartnerId ?? "", mobileHidden: true },
          { key: "billing", header: "Próx. cobrança", cell: (t) => fmtDate(t.nextBillingDate), sort: (t) => t.nextBillingDate, mobileHidden: true },
        ]}
      />
      <NewTenantDialog open={open} onOpenChange={setOpen} plans={plans.filter((p) => p.status === "ativo")} />
    </>
  );
}

function NewTenantDialog({ open, onOpenChange, plans }: { open: boolean; onOpenChange: (o: boolean) => void; plans: { id: string; name: string; version: number }[] }) {
  const navigate = useNavigate();
  const [name, setName] = useState(""); const [city, setCity] = useState(""); const [plan, setPlan] = useState(plans[0]?.id ?? "");
  const [touched, setTouched] = useState(false);
  const errName = name.trim().length < 3 ? "Informe ao menos 3 caracteres." : "";
  const errCity = !/^.+\/[A-Z]{2}$/.test(city.trim()) ? "Use o formato Cidade/UF, ex.: Recife/PE." : "";
  const submit = () => {
    setTouched(true); if (errName || errCity) return;
    const id = actions.createTenant(name.trim(), city.trim(), plan);
    toast.success("Escritório fictício criado em trial (DEMO)"); onOpenChange(false); setName(""); setCity(""); setTouched(false);
    navigate({ to: "/platform/escritorios/$id", params: { id } });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2">Novo escritório <DemoDataBadge /></DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="tn-name">Nome do escritório (fictício)</Label><Input id="tn-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={touched && !!errName} aria-describedby="tn-name-e" />{touched && errName && <p id="tn-name-e" className="text-xs text-destructive">{errName}</p>}</div>
          <div className="space-y-1.5"><Label htmlFor="tn-city">Cidade/UF</Label><Input id="tn-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Recife/PE" aria-invalid={touched && !!errCity} aria-describedby="tn-city-e" /><p id="tn-city-e" className={touched && errCity ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>{touched && errCity ? errCity : "Sem CNPJ: dados reais não são aceitos na demonstração."}</p></div>
          <div className="space-y-1.5"><Label htmlFor="tn-plan">Plano inicial</Label><select id="tn-plan" value={plan} onChange={(e) => setPlan(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">{plans.map((p) => <option key={p.id} value={p.id}>{p.name} v{p.version}</option>)}</select></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={submit}>Criar em trial</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
