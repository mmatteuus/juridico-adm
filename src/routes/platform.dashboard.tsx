import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ActivityTimeline, ChartPanel, KpiGrid, MetricCard, PageHeader, PageSkeleton, Panel, PartialDataBanner, Segmented, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { brl, financeTotals, fmtDateTime, useDemo } from "@/features/demo/store";
import { metricStatus, series, type Period } from "@/features/demo/metrics";

export const Route = createFileRoute("/platform/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — JURIDO SuperAdmin" },
    { name: "description", content: "Indicadores comerciais, receita e operação técnica da plataforma JURIDO em demonstração." },
    { property: "og:title", content: "Dashboard — JURIDO SuperAdmin" },
    { property: "og:description", content: "Indicadores comerciais, receita e operação técnica da plataforma JURIDO em demonstração." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const loading = useFakeLoading();
  const [period, setPeriod] = useState<Period>("30d");
  const s = useDemo((x) => x);
  const fin = financeTotals(s);
  const mode = metricStatus(s.sourceMode);
  if (loading) return <PageSkeleton />;
  const active = s.tenants.filter((t) => t.status === "ativo").length;
  const trials = s.tenants.filter((t) => t.status === "trial").length;
  const delinquent = s.tenants.filter((t) => t.status === "inadimplente").length;
  const canceled = s.tenants.filter((t) => t.status === "cancelado").length;
  const periodMs = period === "24h" ? 24 * 60 * 60 * 1000 : period === "7d" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
  const since = Date.now() - periodMs;
  const inPeriod = (value?: string) => !!value && new Date(value).getTime() >= since;
  const newTenants = s.tenants.filter((t) => inPeriod(t.createdAt)).length;
  const receivedInPeriod = s.invoices.filter((invoice) => invoice.status === "paga" && inPeriod(invoice.paidAt)).reduce((sum, invoice) => sum + invoice.amountMinor, 0);
  const seats = s.tenants.reduce((a, t) => a + t.activeSeats, 0);
  const urgent = s.tickets.filter((t) => t.priority === "urgente" && !["resolvido", "encerrado"].includes(t.status));
  const overdue = s.invoices.filter((i) => i.status === "vencida");
  const req = series("requests", period);
  return (
    <>
      <PageHeader title="Dashboard executivo" description="Visão consolidada da plataforma. Receita recebida e MRR são exibidos separadamente." actions={<Segmented label="Período" value={period} onChange={setPeriod} options={["24h", "7d", "30d"] as const} />} />
      <PartialDataBanner />
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comercial</h2>
      <KpiGrid>
        <MetricCard label="Escritórios ativos" value={active} hint={`${s.tenants.length} cadastrados`} source="Mock store local · sem coleta externa" to="/platform/escritorios" spark={[14, 15, 15, 16, 17, active]} />
        <MetricCard label="Em trial" value={trials} hint="Contas em período de avaliação" source="Mock store local · sem coleta externa" to="/platform/escritorios" />
        <MetricCard label={`Novos (${period})`} value={newTenants} hint="Cadastros no período selecionado" source="Mock store local · sem coleta externa" to="/platform/escritorios" />
        <MetricCard label="Inadimplentes" value={delinquent} hint="Escritórios com status inadimplente" source="Mock store local · sem coleta externa" to="/platform/financeiro" />
        <MetricCard label="Contas canceladas" value={canceled} hint="Status atual; não há timestamp de cancelamento no fixture" source="Mock store local · sem coleta externa" to="/platform/assinaturas" />
        <MetricCard label="Assentos em uso" value={seats} unit="usuários" source="Mock store local · sem coleta externa" to="/platform/licencas" />
        <MetricCard label="MRR contratual" value={brl(fin.mrr)} hint="Soma das assinaturas ativas/regularização; não é recebimento" source="Assinaturas da demonstração · sem timestamp de coleta" to="/platform/assinaturas" />
        <MetricCard label="ARR contratual" value={brl(fin.arr)} hint="ARR = MRR × 12; projeção anual, não receita recebida" source="Assinaturas da demonstração · sem timestamp de coleta" to="/platform/assinaturas" />
        <MetricCard label={`Receita recebida (${period})`} value={brl(receivedInPeriod)} hint="Faturas pagas no período; não inclui MRR" source="Faturas da demonstração · sem timestamp de coleta" to="/platform/financeiro" />
      </KpiGrid>
      <h2 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operação técnica</h2>
      <KpiGrid>
        <MetricCard label="Requisições Workers" value={mode === "unavailable" ? null : req.reduce((a, d) => a + d.value, 0).toLocaleString("pt-BR")} status={mode} source="Cloudflare não conectado · sem horário de coleta real" to="/platform/infra/trafego" spark={req.map((d) => d.value)} />
        <MetricCard label="Latência p95" value={mode === "unavailable" ? null : 212} unit="ms" status={mode} source="Cloudflare não conectado · sem horário de coleta real" to="/platform/infra/trafego" delta={-6} />
        <MetricCard label="Armazenamento Neon" value={mode === "unavailable" ? null : 318} unit="GB" status={mode} source="Neon não conectado · sem horário de coleta real" to="/platform/infra/banco" />
        <MetricCard label="Custo estimado mês" value={mode === "unavailable" ? null : "R$ 12.480"} status={mode === "demo" ? "estimate" : mode} source="Estimativa FinOps · sem horário de coleta real" to="/platform/infra/custos" />
      </KpiGrid>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2"><ChartPanel title="Volume de requisições" data={req} unit="req" status={mode} source="Cloudflare Workers (não conectado)" period={period} /></div>
        <Panel title="Incidentes abertos" actions={<Link to="/platform/incidentes" className="text-xs text-primary">Ver todos</Link>}>
          <ul className="space-y-3">{s.incidents.filter((i) => i.status !== "resolvido").map((i) => <li key={i.id} className="flex items-start justify-between gap-2 text-sm"><span>{i.title}<span className="block text-xs text-muted-foreground">{i.id} · {i.service}</span></span><StatusBadge status={i.severity} /></li>)}</ul>
          {s.incidents.every((i) => i.status === "resolvido") && <p className="text-sm text-muted-foreground">Nenhum incidente aberto.</p>}
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Tickets urgentes" actions={<Link to="/platform/suporte" className="text-xs text-primary">Central</Link>}>
          <ul className="space-y-2">{urgent.slice(0, 5).map((t) => <li key={t.id}><Link to="/platform/suporte/$id" params={{ id: t.id }} className="flex justify-between gap-2 text-sm hover:text-primary"><span className="truncate">{t.subject}</span><StatusBadge status={t.status} /></Link></li>)}</ul>
          {!urgent.length && <p className="text-sm text-muted-foreground">Nenhum ticket urgente.</p>}
        </Panel>
        <Panel title="Cobranças vencidas" actions={<Link to="/platform/financeiro" className="text-xs text-primary">Financeiro</Link>}>
          <ul className="space-y-2">{overdue.slice(0, 5).map((i) => <li key={i.id} className="flex justify-between text-sm"><span>{i.id}<span className="block text-xs text-muted-foreground">{s.tenants.find((t) => t.id === i.tenantId)?.displayName}</span></span><span className="tnum font-medium text-destructive">{brl(i.amountMinor)}</span></li>)}</ul>
          {!overdue.length && <p className="text-sm text-muted-foreground">Nenhuma cobrança vencida.</p>}
        </Panel>
        <Panel title="Eventos recentes (auditoria)" actions={<Link to="/platform/seguranca" className="text-xs text-primary">Auditoria</Link>}>
          <ActivityTimeline items={s.audit.slice(0, 5).map((a) => ({ id: a.id, when: fmtDateTime(a.when), title: `${a.action} · ${a.objectId}`, meta: a.outcome }))} />
        </Panel>
      </div>
    </>
  );
}
