import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog, EmptyState, KpiGrid, MetricCard, PageHeader, Panel, StatusBadge } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { actions, brl, fmtDate, useDemo } from "@/features/demo/store";
import type { CommissionEntry } from "@/features/demo/types";

export const Route = createFileRoute("/platform/revendedores/$id")({
  head: () => ({ meta: [{ title: "Parceiro — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: ResellerDetail,
});

function ResellerDetail() {
  const { id } = Route.useParams();
  const r = useDemo((s) => s.resellers.find((x) => x.id === id));
  const tenants = useDemo((s) => s.tenants);
  const all = useDemo((s) => s.commissions);
  const [lead, setLead] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [adjust, setAdjust] = useState<CommissionEntry | null>(null);
  if (!r) return <EmptyState title="Parceiro não encontrado" action={<Button asChild variant="outline"><Link to="/platform/revendedores">Voltar</Link></Button>} />;
  const cms = all.filter((c) => c.resellerId === id);
  const gross = cms.filter((c) => c.state !== "ajuste").reduce((a, c) => a + c.amountMinor, 0);
  const adj = cms.filter((c) => c.state === "ajuste").reduce((a, c) => a + c.amountMinor, 0);
  const free = tenants.filter((t) => !r.attributedTenants.includes(t.id));
  return (
    <>
      <Link to="/platform/revendedores" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Revendedores</Link>
      <PageHeader title={r.name} description={`${r.type} · ${r.region} · contrato ${r.contractVersion}`} actions={<StatusBadge status={r.status} />} />
      <KpiGrid>
        <MetricCard label="Carteira" value={r.attributedTenants.length} unit={`/ meta ${r.goalTenants}`} />
        <MetricCard label="Leads" value={r.leads.length} />
        <MetricCard label="Comissões brutas" value={brl(gross)} />
        <MetricCard label="Ajustes (estornos)" value={brl(adj)} hint={`Líquido: ${brl(gross + adj)}`} />
      </KpiGrid>
      <Tabs defaultValue="carteira" className="mt-4">
        <TabsList><TabsTrigger value="carteira">Escritórios</TabsTrigger><TabsTrigger value="leads">Leads</TabsTrigger><TabsTrigger value="extrato">Extrato de comissões</TabsTrigger></TabsList>
        <TabsContent value="carteira" className="mt-4">
          <Panel title="Escritórios atribuídos" description="Apenas dados comerciais.">
            <div className="mb-4 flex flex-wrap items-end gap-2">
              <div className="space-y-1.5"><Label htmlFor="at">Atribuir escritório</Label><select id="at" className="h-9 w-64 rounded-md border bg-background px-2 text-sm" value={tenantId} onChange={(e) => setTenantId(e.target.value)}><option value="">Selecionar…</option>{free.map((t) => <option key={t.id} value={t.id}>{t.displayName}</option>)}</select></div>
              <Button disabled={!tenantId} onClick={() => { actions.attributeTenant(id, tenantId); setTenantId(""); toast.success("Escritório atribuído; comissão prevista gerada (DEMO)"); }}>Atribuir</Button>
            </div>
            {r.attributedTenants.length ? <ul className="divide-y text-sm">{r.attributedTenants.map((tid) => { const t = tenants.find((x) => x.id === tid); return <li key={tid} className="flex justify-between py-2"><Link to="/platform/escritorios/$id" params={{ id: tid }} className="text-primary hover:underline">{t?.displayName ?? tid}</Link>{t && <StatusBadge status={t.status} />}</li>; })}</ul> : <EmptyState title="Carteira vazia" />}
          </Panel>
        </TabsContent>
        <TabsContent value="leads" className="mt-4">
          <Panel title="Leads comerciais">
            <div className="mb-4 flex flex-wrap items-end gap-2"><div className="space-y-1.5"><Label htmlFor="ld">Novo lead (empresa fictícia)</Label><Input id="ld" className="w-64" value={lead} onChange={(e) => setLead(e.target.value)} /></div><Button disabled={lead.trim().length < 3} onClick={() => { actions.addLead(id, lead.trim()); setLead(""); toast.success("Lead adicionado"); }}>Adicionar</Button></div>
            {r.leads.length ? <ul className="divide-y text-sm">{r.leads.map((l) => <li key={l.id} className="flex justify-between py-2"><span>{l.company}</span><StatusBadge status={l.stage} /></li>)}</ul> : <EmptyState title="Sem leads" />}
          </Panel>
        </TabsContent>
        <TabsContent value="extrato" className="mt-4">
          <Panel title="Extrato simulado" description="Estornos geram lançamento de ajuste; o lançamento original nunca é alterado.">
            {cms.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Lançamento</th><th>Fatura</th><th>Data</th><th>Estado</th><th className="text-right">Valor</th><th /></tr></thead>
              <tbody>{cms.map((c) => <tr key={c.id} className="border-b last:border-0"><td className="py-2">{c.id}{c.adjustmentRef && <span className="block text-xs text-muted-foreground">ajusta {c.adjustmentRef}</span>}</td><td>{c.invoiceRef}</td><td>{fmtDate(c.createdAt)}</td><td><StatusBadge status={c.state} /></td><td className="tnum text-right">{brl(c.amountMinor)}</td><td className="text-right">{c.state !== "ajuste" && !cms.some((x) => x.adjustmentRef === c.id) && <Button size="sm" variant="outline" onClick={() => setAdjust(c)}>Simular estorno</Button>}</td></tr>)}</tbody></table></div> : <EmptyState title="Sem comissões" text="Atribua um escritório com fatura paga para gerar comissão." />}
          </Panel>
        </TabsContent>
      </Tabs>
      <ConfirmationDialog open={!!adjust} onOpenChange={(o) => !o && setAdjust(null)} destructive title="Ajuste por estorno" object={adjust?.id ?? ""} operation="Lançar ajuste negativo" impact="Cria novo lançamento; o original permanece inalterado." onConfirm={(reason) => { actions.adjustCommission(adjust!.id, reason); toast.success("Ajuste lançado (DEMO)"); }} />
    </>
  );
}
