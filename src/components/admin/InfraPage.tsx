import { useState, type ReactNode } from "react";
import { ChartPanel, KpiGrid, MetricCard, PageHeader, PageSkeleton, PartialDataBanner, Segmented, useFakeLoading } from "./kit";
import { useDemo } from "@/features/demo/store";
import { APPS, metricStatus, series, type Period } from "@/features/demo/metrics";
import type { MetricStatus } from "@/features/demo/types";

export interface InfraMetric { key: string; label: string; unit: string; agg?: "sum" | "avg" | "last"; type?: "area" | "bar" | "line"; status?: MetricStatus }

export function InfraPage({ title, description, source, metrics, withApp, children }: {
  title: string; description: string; source: string; metrics: InfraMetric[]; withApp?: boolean; children?: (ctx: { status: MetricStatus; period: Period; app: string }) => ReactNode;
}) {
  const loading = useFakeLoading();
  const mode = useDemo((s) => s.sourceMode);
  const [period, setPeriod] = useState<Period>("7d");
  const [app, setApp] = useState<string>("todas");
  if (loading) return <PageSkeleton />;
  const status = (m: InfraMetric) => metricStatus(mode, m.status ?? "demo");
  const value = (m: InfraMetric) => {
    if (status(m) === "unavailable") return null;
    const d = series(m.key, period, app).map((x) => x.value);
    if (d.length === 0) return null;
    const v = m.agg === "sum" ? d.reduce((a, b) => a + b, 0) : m.agg === "last" ? d[d.length - 1] : Math.round(d.reduce((a, b) => a + b, 0) / d.length);
    return v.toLocaleString("pt-BR");
  };
  const ctxStatus = metricStatus(mode);
  return (
    <>
      <PageHeader title={title} description={description} actions={<>
        {withApp && <label className="flex items-center gap-2 text-xs text-muted-foreground">App<select aria-label="Filtrar por app" className="h-8 rounded-md border bg-card px-2 text-sm text-foreground" value={app} onChange={(e) => setApp(e.target.value)}>{APPS.map((a) => <option key={a}>{a}</option>)}</select></label>}
        <Segmented label="Período" value={period} onChange={setPeriod} options={["24h", "7d", "30d"] as const} />
      </>} />
      <PartialDataBanner />
      <p className="mb-4 text-xs text-muted-foreground">Fonte: {source} — <strong>não conectado · demonstração</strong>. Janela no fuso America/Sao_Paulo; última coleta real indisponível. Use o menu do perfil → “Simular estado das fontes” para testar parcial/indisponível.</p>
      <KpiGrid>{metrics.slice(0, 4).map((m) => <MetricCard key={m.key} label={m.label} value={value(m)} unit={m.unit} status={status(m)} source={source} spark={status(m) === "unavailable" ? undefined : series(m.key, period, app).map((x) => x.value)} />)}</KpiGrid>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {metrics.map((m) => <ChartPanel key={m.key} title={m.label} data={series(m.key, period, app)} unit={m.unit} type={m.type} status={status(m)} source={source} period={`${period}${withApp ? ` · ${app}` : ""}`} />)}
      </div>
      {children && <div className="mt-4 space-y-4">{children({ status: ctxStatus, period, app })}</div>}
    </>
  );
}
