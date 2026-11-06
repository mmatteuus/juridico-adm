import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DemoDataBadge, KpiGrid, MetricCard, PageHeader, PageSkeleton, Panel, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, brl, useDemo } from "@/features/demo/store";
import type { Reseller } from "@/features/demo/types";

export const Route = createFileRoute("/platform/revendedores/")({
  head: () => ({ meta: [
    { title: "Revendedores — JURIDO SuperAdmin" },
    { name: "description", content: "Parceiros comerciais, carteira e comissões demonstrativas do software JURIDO." },
    { property: "og:title", content: "Revendedores — JURIDO SuperAdmin" },
    { property: "og:description", content: "Parceiros comerciais, carteira e comissões demonstrativas do software JURIDO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Revendedores,
});

const STAGES = ["novo", "qualificado", "proposta", "ganho", "perdido"] as const;

function Revendedores() {
  const loading = useFakeLoading();
  const resellers = useDemo((s) => s.resellers);
  const commissions = useDemo((s) => s.commissions);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [type, setType] = useState<Reseller["type"]>("revendedor"); const [region, setRegion] = useState("Sudeste");
  const [touched, setTouched] = useState(false);
  if (loading) return <PageSkeleton />;
  const leads = resellers.flatMap((r) => r.leads);
  const total = (id: string) => commissions.filter((c) => c.resellerId === id).reduce((a, c) => a + c.amountMinor, 0);
  const err = name.trim().length < 3;
  return (
    <>
      <PageHeader title="Parceiros e revenda" description="Comissões referem-se à venda de software — nunca a honorários advocatícios. Parceiros não veem dados jurídicos." actions={<Button onClick={() => setOpen(true)}><Plus /> Novo parceiro</Button>} />
      <KpiGrid>
        <MetricCard label="Parceiros ativos" value={resellers.filter((r) => r.status === "ativo").length} />
        <MetricCard label="Escritórios atribuídos" value={resellers.reduce((a, r) => a + r.attributedTenants.length, 0)} />
        <MetricCard label="Leads em funil" value={leads.filter((l) => !["ganho", "perdido"].includes(l.stage)).length} />
        <MetricCard label="Comissões líquidas" value={brl(commissions.reduce((a, c) => a + c.amountMinor, 0))} hint="Inclui ajustes por estorno" />
      </KpiGrid>
      <Panel title="Funil de leads" className="mt-4" actions={<DemoDataBadge />}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{STAGES.map((s) => <div key={s} className="rounded-md border p-3"><p className="text-xs capitalize text-muted-foreground">{s}</p><p className="tnum text-xl font-semibold">{leads.filter((l) => l.stage === s).length}</p></div>)}</div>
      </Panel>
      <div className="mt-4">
        <ResourceTable<Reseller> rows={resellers} getId={(r) => r.id} csvName="parceiros" rowLink={(r) => `/platform/revendedores/${r.id}`} searchKeys={(r) => `${r.name} ${r.region}`} statusKey={(r) => r.status} statusOptions={["ativo", "em_analise", "inativo"]}
          columns={[
            { key: "n", header: "Parceiro", cell: (r) => r.name, sort: (r) => r.name },
            { key: "t", header: "Tipo", cell: (r) => r.type, sort: (r) => r.type },
            { key: "s", header: "Status", cell: (r) => <StatusBadge status={r.status} />, sort: (r) => r.status },
            { key: "rg", header: "Região", cell: (r) => r.region, sort: (r) => r.region, mobileHidden: true },
            { key: "c", header: "Carteira / meta", cell: (r) => `${r.attributedTenants.length} / ${r.goalTenants}`, sort: (r) => r.attributedTenants.length },
            { key: "cm", header: "Comissões", cell: (r) => brl(total(r.id)), sort: (r) => total(r.id) },
          ]} />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo parceiro fictício <DemoDataBadge /></DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="rn">Nome</Label><Input id="rn" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={touched && err} />{touched && err && <p className="text-xs text-destructive">Mínimo 3 caracteres.</p>}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor="rt">Tipo</Label><select id="rt" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={type} onChange={(e) => setType(e.target.value as Reseller["type"])}><option value="revendedor">Revendedor</option><option value="indicador">Indicador</option></select></div>
              <div className="space-y-1.5"><Label htmlFor="rr">Região</Label><select id="rr" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={region} onChange={(e) => setRegion(e.target.value)}>{["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"].map((x) => <option key={x}>{x}</option>)}</select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={() => { setTouched(true); if (err) return; const id = actions.createReseller(name.trim(), type, region); toast.success("Parceiro criado (DEMO)"); setOpen(false); setName(""); setTouched(false); navigate({ to: "/platform/revendedores/$id", params: { id } }); }}>Criar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
