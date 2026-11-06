import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ActivityTimeline, ChartPanel, ConfirmationDialog, DemoDataBadge, KpiGrid, MetricCard, PageHeader, PageSkeleton, Panel, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { actions, brl, financeTotals, fmtDate, fmtDateTime, useDemo } from "@/features/demo/store";
import type { SaasInvoice } from "@/features/demo/types";

export const Route = createFileRoute("/platform/financeiro")({
  head: () => ({ meta: [
    { title: "Financeiro — JURIDO SuperAdmin" },
    { name: "description", content: "Faturas, recebimentos, taxas e conciliação financeira do SaaS JURIDO em demonstração." },
    { property: "og:title", content: "Financeiro — JURIDO SuperAdmin" },
    { property: "og:description", content: "Faturas, recebimentos, taxas e conciliação financeira do SaaS JURIDO em demonstração." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Financeiro,
});

function Financeiro() {
  const loading = useFakeLoading();
  const s = useDemo((x) => x);
  const [sel, setSel] = useState<string | null>(null);
  const [refund, setRefund] = useState(false);
  if (loading) return <PageSkeleton />;
  const fin = financeTotals(s);
  const inv = s.invoices.find((i) => i.id === sel);
  const name = (id: string) => s.tenants.find((t) => t.id === id)?.displayName ?? id;
  const months = ["Ago", "Set", "Out"].map((label, m) => ({ label, value: Math.round(s.invoices.filter((i) => i.status === "paga" && i.id.includes(`2026${String(8 + m).padStart(2, "0")}`)).reduce((a, i) => a + i.amountMinor, 0) / 100) }));
  return (
    <>
      <PageHeader title="Financeiro do SaaS" description="Receita recebida (dinheiro confirmado) e MRR (contratual) são métricas distintas e nunca somadas." actions={<Button variant="outline" onClick={() => { actions.reset(); toast.success("Fixtures restauradas"); }}>Restaurar fixture</Button>} />
      <KpiGrid>
        <MetricCard label="Receita recebida" value={brl(fin.received)} hint="Faturas pagas — 3 meses" />
        <MetricCard label="Em aberto (emitidas)" value={brl(fin.open)} />
        <MetricCard label="Inadimplência (vencidas)" value={brl(fin.overdue)} />
        <MetricCard label="Taxas de processamento" value={brl(fin.fees)} hint={`Reembolsos: ${brl(fin.refunded)}`} />
      </KpiGrid>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ChartPanel title="Receita recebida por mês" type="bar" data={months} unit="R$" source="Fixture de faturas" period="3 meses" /></div>
        <Panel title="Conciliação" actions={<DemoDataBadge />}><dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>Recebido bruto</dt><dd className="tnum">{brl(fin.received)}</dd></div>
          <div className="flex justify-between"><dt>(−) Taxas</dt><dd className="tnum">{brl(fin.fees)}</dd></div>
          <div className="flex justify-between border-t pt-2 font-semibold"><dt>Líquido</dt><dd className="tnum">{brl(fin.received - fin.fees)}</dd></div>
          <p className="pt-2 text-xs text-muted-foreground">MRR contratual atual: {brl(fin.mrr)} (não entra na conciliação).</p>
        </dl></Panel>
      </div>
      <div className="mt-4">
        <ResourceTable<SaasInvoice> rows={s.invoices} getId={(i) => i.id} csvName="faturas" searchKeys={(i) => `${i.id} ${name(i.tenantId)} ${i.status} ${fmtDate(i.dueAt)}`} statusKey={(i) => i.status} statusOptions={["emitida", "paga", "vencida", "reembolsada"]}
          columns={[
            { key: "id", header: "Fatura", cell: (i) => <Button variant="link" className="h-auto p-0 text-sm" onClick={() => setSel(i.id)}>{i.id}</Button>, sort: (i) => i.id },
            { key: "t", header: "Escritório", cell: (i) => name(i.tenantId), sort: (i) => name(i.tenantId) },
            { key: "v", header: "Valor", cell: (i) => brl(i.amountMinor), sort: (i) => i.amountMinor, exportValue: (i) => brl(i.amountMinor) },
            { key: "s", header: "Status", cell: (i) => <StatusBadge status={i.status} />, sort: (i) => i.status },
            { key: "d", header: "Vencimento", cell: (i) => fmtDate(i.dueAt), sort: (i) => i.dueAt, exportValue: (i) => fmtDate(i.dueAt), mobileHidden: true },
            { key: "p", header: "Pago em", cell: (i) => fmtDate(i.paidAt), sort: (i) => i.paidAt ?? "", exportValue: (i) => fmtDate(i.paidAt), mobileHidden: true },
          ]} />
      </div>
      <Sheet open={!!inv} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {inv && <>
            <SheetHeader><SheetTitle className="flex items-center gap-2">{inv.id} <DemoDataBadge /></SheetTitle></SheetHeader>
            <div className="space-y-4 px-4 pb-6 text-sm">
              <p>{name(inv.tenantId)}</p>
              <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
                <div><p className="text-xs text-muted-foreground">Emitida</p><p className="tnum">{fmtDate(inv.issuedAt)} · {brl(inv.amountMinor)}</p></div>
                <div><p className="text-xs text-muted-foreground">Paga</p><p className="tnum">{inv.paidAt ? `${fmtDate(inv.paidAt)} · ${brl(inv.amountMinor)}` : "Não paga"}</p></div>
              </div>
              <ul className="divide-y rounded-md border">{inv.lineItems.map((l) => <li key={l.label} className="flex justify-between p-2"><span>{l.label}</span><span className="tnum">{brl(l.amountMinor)}</span></li>)}<li className="flex justify-between p-2 font-semibold"><span>Total</span><span className="tnum">{brl(inv.lineItems.reduce((a, l) => a + l.amountMinor, 0))}</span></li></ul>
              <dl className="grid grid-cols-2 gap-3 border-y py-3">
                <div><dt className="text-xs text-muted-foreground">Vencimento</dt><dd className="tnum">{fmtDate(inv.dueAt)}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Taxa de processamento</dt><dd className="tnum">{brl(inv.feeMinor)}</dd></div>
              </dl>
              <StatusBadge status={inv.status} />
              <div className="flex flex-wrap gap-2">
                {(inv.status === "emitida" || inv.status === "vencida") && <Button onClick={() => { actions.payInvoice(inv.id); toast.success("Pagamento confirmado (simulado) — contabilizado uma única vez"); }}>Simular pagamento confirmado</Button>}
                {inv.status === "paga" && <Button variant="destructive" onClick={() => setRefund(true)}>Simular reembolso</Button>}
              </div>
              <p className="text-xs text-muted-foreground">Nenhum pagamento ou estorno real é processado.</p>
              <section className="border-t pt-4">
                <h3 className="mb-3 text-sm font-semibold">Histórico da fatura</h3>
                <ActivityTimeline items={s.audit.filter((a) => a.objectId === inv.id).map((a) => ({ id: a.id, when: fmtDateTime(a.when), title: a.action === "invoice.mark_paid" ? "Pagamento confirmado (simulado)" : a.action === "invoice.refund" ? "Reembolso registrado (simulado)" : a.action, meta: a.reason }))} />
              </section>
            </div>
          </>}
        </SheetContent>
      </Sheet>
      <ConfirmationDialog open={refund} onOpenChange={setRefund} destructive title="Reembolsar fatura" object={inv?.id ?? ""} operation="Reembolso simulado" impact="Remove o valor da receita recebida e gera ajuste de comissão quando houver parceiro." confirmLabel="Reembolsar" onConfirm={(r) => { if (!inv) return; actions.refundInvoice(inv.id, r); toast.success("Reembolso simulado registrado"); }} />
    </>
  );
}
