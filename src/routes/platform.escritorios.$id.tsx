import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Lock, Plus } from "lucide-react";
import { toast } from "sonner";
import { ActivityTimeline, ConfirmationDialog, EmptyState, KpiGrid, MetricCard, PageHeader, Panel, StatusBadge } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { actions, brl, fmtDate, fmtDateTime, useDemo } from "@/features/demo/store";
import { ADDONS } from "@/features/demo/fixtures";
import { canAccess } from "@/features/demo/roles";

export const Route = createFileRoute("/platform/escritorios/$id")({
  head: () => ({ meta: [{ title: "Ficha do escritório — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: TenantDetail,
});

function TenantDetail() {
  const { id } = Route.useParams();
  const s = useDemo((x) => x);
  const t = s.tenants.find((x) => x.id === id);
  const [grantOpen, setGrantOpen] = useState(false);
  const [revoke, setRevoke] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [statusOp, setStatusOp] = useState<"suspenso" | "ativo" | null>(null);
  const [feature, setFeature] = useState(ADDONS[0]);
  const [until, setUntil] = useState("2026-12-31");
  const [newPlan, setNewPlan] = useState("");
  if (!t) return <EmptyState title="Escritório não encontrado" text={`Nenhum tenant com ID ${id} nos dados demonstrativos.`} action={<Button asChild variant="outline"><Link to="/platform/escritorios">Voltar</Link></Button>} />;
  const plan = s.plans.find((p) => p.id === t.planId)!;
  const sub = s.subscriptions.find((x) => x.tenantId === id);
  const ents = s.entitlements.filter((e) => e.tenantId === id);
  const invoices = s.invoices.filter((i) => i.tenantId === id);
  const tickets = s.tickets.filter((x) => x.tenantId === id);
  const history = s.audit.filter((a) => a.objectId === id);
  const canCommercial = canAccess(s.role, "licencas");
  return (
    <>
      <Link to="/platform/escritorios" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Escritórios</Link>
      <PageHeader title={t.displayName} description={`${t.id} · ${t.city} · cliente desde ${fmtDate(t.createdAt)}`}
        actions={<>
          <StatusBadge status={t.status} />
          {canCommercial && <Button variant="outline" onClick={() => { setNewPlan(t.planId); setPlanOpen(true); }}>Mudar plano</Button>}
          {canCommercial && (t.status === "suspenso" ? <Button variant="outline" onClick={() => setStatusOp("ativo")}>Reativar</Button> : <Button variant="destructive" onClick={() => setStatusOp("suspenso")}>Suspender</Button>)}
        </>} />
      <div className="mb-4 flex items-start gap-2 rounded-[var(--radius)] border bg-muted/60 px-3 py-2 text-xs text-muted-foreground"><Lock className="mt-0.5 size-3.5 shrink-0" />Isolamento: o SuperAdmin não acessa casos, clientes, processos ou documentos deste escritório. Permissões jurídicas são geridas pelo gestor do escritório.</div>
      <Tabs defaultValue="resumo">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resumo">Resumo</TabsTrigger><TabsTrigger value="assinatura">Assinatura</TabsTrigger><TabsTrigger value="licencas">Licenças</TabsTrigger>
          <TabsTrigger value="consumo">Consumo</TabsTrigger><TabsTrigger value="tickets">Tickets</TabsTrigger><TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="resumo" className="mt-4 space-y-4">
          <KpiGrid>
            <MetricCard label="Plano" value={`${plan.name} v${plan.version}`} hint="Preço: a definir" />
            <MetricCard label="Assentos" value={`${t.activeSeats}/${t.seatLimit}`} hint="Agregado, sem identificar usuários" />
            <MetricCard label="Armazenamento" value={t.storageGb} unit={`/ ${plan.storageCapGb} GB`} />
            <MetricCard label="Add-ons ativos" value={ents.filter((e) => e.active).length} />
          </KpiGrid>
          <Panel title="Responsáveis"><p className="text-sm">Resp. comercial: <strong>{t.accountManager}</strong> · Parceiro: <strong>{s.resellers.find((r) => r.id === t.sourcePartnerId)?.name ?? "Venda direta"}</strong></p></Panel>
        </TabsContent>
        <TabsContent value="assinatura" className="mt-4 space-y-4">
          <Panel title="Assinatura">{sub ? <dl className="grid gap-3 text-sm sm:grid-cols-4"><div><dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={sub.status} /></dd></div><div><dt className="text-muted-foreground">Ciclo</dt><dd className="capitalize">{sub.billingCycle}</dd></div><div><dt className="text-muted-foreground">MRR contratual</dt><dd className="tnum">{brl(sub.mrrMinor)}</dd></div><div><dt className="text-muted-foreground">Próxima fatura</dt><dd>{fmtDate(sub.nextInvoiceDate)}</dd></div></dl> : <EmptyState />}</Panel>
          <Panel title="Faturas">{invoices.length ? <ul className="divide-y text-sm">{invoices.map((i) => <li key={i.id} className="flex items-center justify-between py-2"><span>{i.id} <span className="text-xs text-muted-foreground">vence {fmtDate(i.dueAt)}</span></span><span className="flex items-center gap-2"><span className="tnum">{brl(i.amountMinor)}</span><StatusBadge status={i.status} /></span></li>)}</ul> : <EmptyState title="Sem faturas" text="Escritório em trial." />}</Panel>
          <Panel title="Mudanças de plano">{s.planHistory.filter((h) => h.tenantId === id).length ? <ActivityTimeline items={s.planHistory.filter((h) => h.tenantId === id).map((h) => ({ when: fmtDateTime(h.when), title: `${h.from} → ${h.to}`, meta: h.reason }))} /> : <p className="text-sm text-muted-foreground">Nenhuma mudança registrada.</p>}</Panel>
        </TabsContent>
        <TabsContent value="licencas" className="mt-4">
          <Panel title="Entitlements e add-ons" description="Direito comercial — não concede leitura de peças processuais." actions={canCommercial && <Button size="sm" onClick={() => setGrantOpen(true)}><Plus /> Liberar add-on</Button>}>
            <p className="mb-3 text-xs text-muted-foreground">Recursos do plano: {plan.features.join(", ")}</p>
            {ents.length ? <ul className="divide-y text-sm">{ents.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span><strong>{e.featureKey}</strong> <span className="text-xs text-muted-foreground">({e.mode}) · {e.reason} · validade {e.validUntil ? fmtDate(e.validUntil) : "indeterminada"}</span></span>
                <span className="flex items-center gap-2"><StatusBadge status={e.active ? "ativo" : "revogado"} />{e.active && canCommercial && <Button size="sm" variant="outline" onClick={() => setRevoke(e.id)}>Desativar</Button>}</span>
              </li>))}</ul> : <EmptyState title="Sem add-ons" />}
          </Panel>
        </TabsContent>
        <TabsContent value="consumo" className="mt-4">
          <Panel title="Consumo agregado" description="Estimativa por tenant a partir de recursos compartilhados."><KpiGrid>
            <MetricCard label="Armazenamento" value={t.storageGb} unit="GB" status="estimate" source="Estimativa (Neon compartilhado)" />
            <MetricCard label="Chamadas de API (mês)" value={plan.apiCallsMonth ? Math.round(plan.apiCallsMonth * 0.31).toLocaleString("pt-BR") : "Não incluído"} status="estimate" source="Estimativa" />
            <MetricCard label="Usuários ativos" value={t.activeSeats} />
            <MetricCard label="Custo estimado" value={brl(t.storageGb * 45 + t.activeSeats * 120)} status="estimate" source="FinOps estimado" />
          </KpiGrid></Panel>
        </TabsContent>
        <TabsContent value="tickets" className="mt-4">
          <Panel title="Chamados">{tickets.length ? <ul className="divide-y text-sm">{tickets.map((x) => <li key={x.id} className="py-2"><Link to="/platform/suporte/$id" params={{ id: x.id }} className="flex justify-between gap-2 hover:text-primary"><span>{x.id} — {x.subject}</span><StatusBadge status={x.status} /></Link></li>)}</ul> : <EmptyState title="Sem chamados" />}</Panel>
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <Panel title="Histórico de auditoria (DEMO)"><ActivityTimeline items={history.map((a) => ({ id: a.id, when: fmtDateTime(a.when), title: a.action, meta: `${a.actorRole} · ${a.reason ?? ""}` }))} /></Panel>
        </TabsContent>
      </Tabs>

      <ConfirmationDialog open={grantOpen} onOpenChange={setGrantOpen} title="Liberar add-on" object={t.displayName} operation="Conceder entitlement comercial" impact="Habilita o recurso para o escritório; não altera papéis jurídicos." onConfirm={(r) => { actions.grantEntitlement(id, feature, "addon", new Date(until).toISOString(), r); toast.success("Add-on liberado (DEMO)"); }}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="ft">Recurso</Label><select id="ft" value={feature} onChange={(e) => setFeature(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">{ADDONS.map((a) => <option key={a}>{a}</option>)}</select></div>
          <div className="space-y-1.5"><Label htmlFor="vu">Válido até</Label><Input id="vu" type="date" value={until} onChange={(e) => setUntil(e.target.value)} /></div>
        </div>
      </ConfirmationDialog>
      <ConfirmationDialog open={!!revoke} onOpenChange={(o) => !o && setRevoke(null)} destructive title="Desativar add-on" object={ents.find((e) => e.id === revoke)?.featureKey ?? ""} operation="Revogar entitlement comercial" impact="O registro anterior é preservado no histórico; nenhum dado do escritório é apagado." confirmLabel="Desativar" onConfirm={(r) => { actions.revokeEntitlement(revoke!, r); toast.success("Add-on desativado (DEMO)"); }} />
      <ConfirmationDialog open={planOpen} onOpenChange={setPlanOpen} title="Mudar plano" object={t.displayName} operation={`Upgrade/downgrade simulado`} impact="Atualiza limite de assentos e histórico. Cobrança proporcional: [PENDENTE]." onConfirm={(r) => { if (newPlan === t.planId) return; actions.changePlan(id, newPlan, r); toast.success("Plano alterado (DEMO)"); }}>
        <div className="space-y-1.5"><Label htmlFor="np">Novo plano</Label><select id="np" value={newPlan} onChange={(e) => setNewPlan(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">{s.plans.filter((p) => p.status === "ativo").map((p) => <option key={p.id} value={p.id}>{p.name} v{p.version} — {p.seatLimit} assentos</option>)}</select></div>
      </ConfirmationDialog>
      <ConfirmationDialog open={!!statusOp} onOpenChange={(o) => !o && setStatusOp(null)} destructive={statusOp === "suspenso"} title={statusOp === "suspenso" ? "Suspender escritório" : "Reativar escritório"} object={t.displayName} operation={statusOp === "suspenso" ? "Suspensão comercial" : "Reativação"} impact="Suspender NÃO apaga documentos, clientes ou processos. Janela contratual: [PENDENTE]." onConfirm={(r) => { actions.setTenantStatus(id, statusOp!, r); toast.success("Status atualizado (DEMO)"); }} />
    </>
  );
}
