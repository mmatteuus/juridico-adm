import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Minus } from "lucide-react";
import { toast } from "sonner";
import { DemoDataBadge, PageHeader, PageSkeleton, Panel, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, fmtDate, useDemo } from "@/features/demo/store";
import { FEATURE_FLAGS } from "@/features/demo/fixtures";
import type { PlanVersion } from "@/features/demo/types";

export const Route = createFileRoute("/platform/planos")({
  head: () => ({ meta: [{ title: "Planos — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: Planos,
});

const ALL = ["agenda", "processos", "documentos", "financeiro", "portal_cliente", "api", "sso", "auditoria"];

function Planos() {
  const loading = useFakeLoading();
  const plans = useDemo((s) => s.plans);
  const tenants = useDemo((s) => s.tenants);
  const [base, setBase] = useState<PlanVersion | null>(null);
  const [seats, setSeats] = useState(0);
  if (loading) return <PageSkeleton />;
  const active = plans.filter((p) => p.status !== "arquivado");
  return (
    <>
      <PageHeader title="Catálogo de planos" description="Versões de plano com benefícios e limites. Preços comerciais: a definir." />
      <div className="grid gap-4 md:grid-cols-3">
        {active.map((p) => (
          <Panel key={p.id} title={`${p.name} · v${p.version}`} description={`Vigente desde ${fmtDate(p.effectiveFrom)}`} actions={<StatusBadge status={p.status} />}>
            <p className="text-2xl font-semibold">A definir <DemoDataBadge className="align-middle" /></p>
            <ul className="mt-3 space-y-1 text-sm"><li>{p.seatLimit} assentos</li><li>{p.storageCapGb} GB armazenamento</li><li>{p.apiCallsMonth ? `${p.apiCallsMonth.toLocaleString("pt-BR")} chamadas API/mês` : "Sem API"}</li><li className="text-muted-foreground">{tenants.filter((t) => t.planId === p.id).length} escritórios neste plano</li></ul>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setBase(p); setSeats(p.seatLimit); }}><Copy /> Criar nova versão</Button>
          </Panel>
        ))}
      </div>
      <Panel title="Comparação de recursos" className="mt-4">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Recurso</th>{active.map((p) => <th key={p.id} className="py-2">{p.name} v{p.version}</th>)}</tr></thead>
          <tbody>{ALL.map((f) => <tr key={f} className="border-b last:border-0"><td className="py-2">{f}</td>{active.map((p) => <td key={p.id}>{p.features.includes(f) ? <Check className="size-4 text-success" aria-label="incluído" /> : <Minus className="size-4 text-muted-foreground" aria-label="não incluído" />}</td>)}</tr>)}</tbody></table></div>
      </Panel>
      <Panel title="Feature flags (disponibilidade técnica)" description="Diferente de entitlement (direito comercial) e de permissão (ação do usuário)." className="mt-4">
        <ul className="divide-y text-sm">{FEATURE_FLAGS.map((f) => <li key={f.key} className="flex justify-between py-2"><span><code className="text-xs">{f.key}</code> — {f.description}</span><StatusBadge status={f.available ? "ativo" : "planejado"} /></li>)}</ul>
      </Panel>
      <Panel title="Versões arquivadas" className="mt-4"><ul className="text-sm">{plans.filter((p) => p.status === "arquivado").map((p) => <li key={p.id}>{p.name} v{p.version} — {p.features.length} recursos</li>)}</ul></Panel>
      <Dialog open={!!base} onOpenChange={(o) => !o && setBase(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova versão de {base?.name} <DemoDataBadge /></DialogTitle></DialogHeader>
          <div className="space-y-1.5"><Label htmlFor="seats">Limite de assentos</Label><Input id="seats" type="number" min={1} value={seats} onChange={(e) => setSeats(Number(e.target.value))} aria-invalid={seats < 1} />{seats < 1 && <p className="text-xs text-destructive">Mínimo 1.</p>}<p className="text-xs text-muted-foreground">A versão nasce como rascunho; escritórios atuais continuam na versão vigente.</p></div>
          <DialogFooter><Button variant="outline" onClick={() => setBase(null)}>Cancelar</Button><Button disabled={seats < 1} onClick={() => { actions.createPlanVersion(base!.id, { seatLimit: seats }); toast.success("Rascunho de versão criado (DEMO)"); setBase(null); }}>Criar rascunho</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
