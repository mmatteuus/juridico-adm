import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Inbox, Lock, Search, ServerCrash, WifiOff } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MetricStatus } from "@/features/demo/types";
import { useDemo } from "@/features/demo/store";

/* ---------- Badges ---------- */
export function DemoDataBadge({ className }: { className?: string }) {
  return <span className={cn("inline-flex items-center rounded border border-warning/40 bg-warning-soft px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-warning", className)}>DEMO</span>;
}

const TONES = {
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-destructive border-destructive/30",
  info: "bg-info-soft text-info border-info/30",
  neutral: "bg-muted text-muted-foreground border-border",
  brand: "bg-accent text-accent-foreground border-primary/30",
} as const;
export type Tone = keyof typeof TONES;
const STATUS_TONE: Record<string, Tone> = {
  ativo: "success", ativa: "success", paga: "success", saudavel: "success", resolvido: "success", ganho: "success", aprovada: "success", encerrado: "neutral",
  trial: "info", emitida: "info", em_andamento: "info", qualificado: "info", monitorando: "info", prevista: "info", novo: "info", demo: "warning",
  inadimplente: "danger", vencida: "danger", urgente: "danger", SEV1: "danger", revogado: "danger", investigando: "danger", perdido: "danger", unavailable: "danger",
  regularizacao: "warning", aguardando: "warning", alta: "warning", degradado: "warning", SEV2: "warning", em_analise: "warning", partial: "warning", estimate: "info", mitigado: "warning", proposta: "warning", ajuste: "warning",
  suspenso: "neutral", suspensa: "neutral", cancelado: "neutral", cancelada: "neutral", reembolsada: "neutral", planejado: "neutral", rascunho: "neutral", arquivado: "neutral", inativo: "neutral", media: "neutral", baixa: "neutral", SEV3: "neutral", aberto: "brand",
};
const LABELS: Record<string, string> = { em_andamento: "em andamento", regularizacao: "regularização", em_analise: "em análise", media: "média", saudavel: "saudável", unavailable: "indisponível", partial: "parcial", estimate: "estimativa", demo: "demo" };
export function StatusBadge({ status, tone }: { status: string; tone?: Tone }) {
  const t = tone ?? STATUS_TONE[status] ?? "neutral";
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium capitalize", TONES[t])}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {LABELS[status] ?? status.replace(/_/g, " ")}
    </span>
  );
}

export function MetricSourceLabel({ source, status, period }: { source: string; status: MetricStatus; period?: string }) {
  return (
    <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
      <StatusBadge status={status} />
      <span>Fonte: {source}</span>
      {period && <span>· {period}</span>}
    </p>
  );
}

/* ---------- Layout ---------- */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, actions, children, className }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[var(--radius)] border bg-card shadow-[0_1px_2px_oklch(0.2_0.03_255/0.04)]", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

/* ---------- Metric card ---------- */
export function MetricCard({ label, value, unit, delta, spark, status = "demo", source = "Fixture local", to, hint }: {
  label: string; value: string | number | null; unit?: string; delta?: number; spark?: number[]; status?: MetricStatus; source?: string; to?: string; hint?: string;
}) {
  const unavailable = status === "unavailable" || value === null;
  const body = (
    <div className="group flex h-full flex-col gap-2 rounded-[var(--radius)] border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <DemoDataBadge />
      </div>
      {unavailable ? (
        <div className="flex items-center gap-2 py-1 text-sm font-medium text-destructive"><WifiOff className="size-4" /> Fonte indisponível — sem valor</div>
      ) : (
        <div className="flex items-end justify-between gap-2">
          <div className="tnum text-2xl font-semibold tracking-tight">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
          </div>
          {spark && <Sparkline data={spark} />}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        {delta !== undefined && !unavailable ? (
          <span className={cn("tnum inline-flex items-center text-xs font-medium", delta >= 0 ? "text-success" : "text-destructive")}>
            {delta >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}{Math.abs(delta)}% vs. período anterior
          </span>
        ) : <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <MetricSourceLabel source={source} status={status} />
    </div>
  );
  return to ? <Link to={to} className="block rounded-[var(--radius)]">{body}</Link> : body;
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 64},${22 - ((v - min) / (max - min || 1)) * 20}`).join(" ");
  return <svg width="64" height="24" aria-hidden className="text-primary"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

/* ---------- Charts ---------- */
export function ChartPanel({ title, data, unit, type = "area", status = "demo", source, period, height = 220 }: {
  title: string; data: { label: string; value: number }[]; unit: string; type?: "area" | "bar" | "line"; status?: MetricStatus; source: string; period: string; height?: number;
}) {
  const shown = status === "partial" ? data.map((d, i) => (i > data.length * 0.6 ? { ...d, value: null as unknown as number } : d)) : data;
  return (
    <Panel title={title} description={`Unidade: ${unit} · Período: ${period}`} actions={<DemoDataBadge />}>
      {status === "unavailable" ? (
        <UnavailableState />
      ) : (
        <div style={{ height }} role="img" aria-label={`${title} — gráfico demonstrativo em ${unit}`}>
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={shown}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" width={48} /><Tooltip formatter={(v) => [`${v} ${unit}`, title]} /><Bar isAnimationActive={false} dataKey="value" fill="var(--chart-1)" radius={[3, 3, 0, 0]} /></BarChart>
            ) : type === "line" ? (
              <LineChart data={shown}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" width={48} /><Tooltip formatter={(v) => [`${v} ${unit}`, title]} /><Line isAnimationActive={false} dataKey="value" stroke="var(--chart-2)" strokeWidth={2} dot={false} /></LineChart>
            ) : (
              <AreaChart data={shown}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" width={48} /><Tooltip formatter={(v) => [`${v} ${unit}`, title]} /><Area isAnimationActive={false} dataKey="value" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.12} strokeWidth={2} /></AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <MetricSourceLabel source={source} status={status} period={period} />
        <span className="text-[11px] font-medium uppercase tracking-wide text-warning">Dados demonstrativos — sem conexão ao provedor</span>
      </div>
    </Panel>
  );
}

/* ---------- States ---------- */
export function EmptyState({ title = "Nada por aqui", text, action }: { title?: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Inbox className="size-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {text && <p className="max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action}
    </div>
  );
}
export function UnavailableState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center" role="status">
      <ServerCrash className="size-8 text-destructive" />
      <p className="font-medium">Fonte indisponível</p>
      <p className="max-w-sm text-sm text-muted-foreground">Não exibimos zero quando não há dados. Nenhum provedor está conectado nesta demonstração.</p>
    </div>
  );
}
export function PartialDataBanner() {
  const mode = useDemo((s) => s.sourceMode);
  if (mode === "ok") return null;
  return (
    <div role="status" className={cn("mb-4 flex items-start gap-2 rounded-[var(--radius)] border px-3 py-2 text-sm", mode === "partial" ? TONES.warning : TONES.danger)}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      {mode === "partial" ? "Dados parciais/desatualizados (simulado): parte das séries não chegou. Valores podem estar incompletos." : "Fonte indisponível (simulado): métricas técnicas sem valor. Nunca tratamos ausência como zero."}
    </div>
  );
}
export function AccessDenied() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-[var(--radius)] border bg-card p-8 text-center">
      <Lock className="mx-auto size-8 text-muted-foreground" />
      <h1 className="mt-3 text-lg font-semibold">Acesso negado (DEMO)</h1>
      <p className="mt-1 text-sm text-muted-foreground">Seu perfil de demonstração não tem permissão para esta área. Isto é apenas ilustrativo — não é um controle de segurança real.</p>
      <Button asChild className="mt-4"><Link to="/platform/dashboard">Voltar ao dashboard</Link></Button>
    </div>
  );
}
export function useFakeLoading(ms = 350) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), ms); return () => clearTimeout(t); }, [ms]);
  return loading;
}
export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      <Skeleton className="h-72" />
    </div>
  );
}

/* ---------- Timeline ---------- */
export function ActivityTimeline({ items }: { items: { id?: string; when: string; title: string; meta?: string; tone?: Tone }[] }) {
  if (!items.length) return <EmptyState title="Sem eventos" />;
  return (
    <ol className="relative space-y-4 border-l pl-4">
      {items.map((it, i) => (
        <li key={it.id ?? i} className="relative">
          <span className={cn("absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-card", it.tone === "danger" ? "bg-destructive" : it.tone === "warning" ? "bg-warning" : "bg-primary")} />
          <p className="text-sm">{it.title}</p>
          <p className="text-xs text-muted-foreground">{it.when}{it.meta ? ` · ${it.meta}` : ""}</p>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Confirmation dialog with mandatory justification ---------- */
export function ConfirmationDialog({ open, onOpenChange, title, object, operation, impact, confirmLabel = "Confirmar", destructive, onConfirm, children }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; object: string; operation: string; impact: string; confirmLabel?: string; destructive?: boolean; onConfirm: (reason: string) => void; children?: ReactNode;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const invalid = reason.trim().length < 10;
  useEffect(() => { if (!open) { setReason(""); setTouched(false); } }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{title} <DemoDataBadge /></DialogTitle>
          <DialogDescription>Esta ação altera apenas o estado local da demonstração e gera um registro de auditoria DEMO.</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 rounded-md bg-muted p-3 text-sm">
          <dt className="text-muted-foreground">Objeto</dt><dd className="font-medium">{object}</dd>
          <dt className="text-muted-foreground">Operação</dt><dd>{operation}</dd>
          <dt className="text-muted-foreground">Impacto</dt><dd>{impact}</dd>
        </dl>
        {children}
        <div className="space-y-1.5">
          <Label htmlFor="justificativa">Justificativa obrigatória</Label>
          <Textarea id="justificativa" value={reason} onChange={(e) => setReason(e.target.value)} onBlur={() => setTouched(true)} aria-invalid={touched && invalid} aria-describedby="just-help" placeholder="Descreva o motivo (mín. 10 caracteres)" />
          <p id="just-help" className={cn("text-xs", touched && invalid ? "text-destructive" : "text-muted-foreground")}>{touched && invalid ? "Informe ao menos 10 caracteres." : "Registrada na trilha de auditoria simulada."}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant={destructive ? "destructive" : "default"} disabled={invalid} onClick={() => { onConfirm(reason.trim()); onOpenChange(false); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Resource table ---------- */
export interface Column<T> { key: string; header: string; cell: (row: T) => ReactNode; sort?: (row: T) => string | number; className?: string; mobileHidden?: boolean }
export function ResourceTable<T>({ rows, columns, searchKeys, statusKey, statusOptions, rowLink, pageSize = 10, csvName, emptyText, toolbar, getId }: {
  rows: T[]; columns: Column<T>[]; searchKeys: (row: T) => string; statusKey?: (row: T) => string; statusOptions?: string[];
  rowLink?: (row: T) => string; pageSize?: number; csvName?: string; emptyText?: string; toolbar?: ReactNode; getId: (row: T) => string;
}) {
  const [q, setQ] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => {
    let out = rows.filter((r) => searchKeys(r).toLowerCase().includes(q.toLowerCase()));
    if (statusKey && statuses.length) out = out.filter((r) => statuses.includes(statusKey(r)));
    if (sort) { const col = columns.find((c) => c.key === sort.key); if (col?.sort) out = [...out].sort((a, b) => (col.sort!(a) > col.sort!(b) ? 1 : -1) * sort.dir); }
    return out;
  }, [rows, q, statuses, sort, columns, searchKeys, statusKey]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const slice = filtered.slice(cur * pageSize, cur * pageSize + pageSize);

  const exportCsv = () => {
    const head = columns.map((c) => c.header).join(";");
    const body = filtered.map((r) => columns.map((c) => { const v = c.sort ? c.sort(r) : ""; return `"${String(v).replace(/"/g, '""')}"`; }).join(";")).join("\n");
    const blob = new Blob([`# DADOS DEMONSTRATIVOS\n${head}\n${body}`], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${csvName ?? "export"}-demo.csv`; a.click();
  };

  return (
    <div className="rounded-[var(--radius)] border bg-card">
      <div className="flex flex-col gap-2 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input aria-label="Buscar na tabela" placeholder="Buscar…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} className="h-9 pl-8" />
          </div>
          {statusOptions?.map((s) => {
            const on = statuses.includes(s);
            return (
              <button key={s} type="button" aria-pressed={on} onClick={() => { setStatuses(on ? statuses.filter((x) => x !== s) : [...statuses, s]); setPage(0); }}
                className={cn("rounded-full border px-2.5 py-1 text-xs capitalize transition-colors", on ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted")}>
                {LABELS[s] ?? s.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">{toolbar}{csvName && <Button variant="outline" size="sm" onClick={exportCsv}><Download /> CSV (fixture)</Button>}</div>
      </div>
      {slice.length === 0 ? <EmptyState title="Nenhum resultado" text={emptyText ?? "Ajuste a busca ou os filtros."} /> : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                {columns.map((c) => (
                  <th key={c.key} scope="col" className={cn("px-3 py-2 font-medium", c.className)}>
                    {c.sort ? (
                      <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setSort(sort?.key === c.key ? { key: c.key, dir: sort.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 })}>
                        {c.header}{sort?.key === c.key && (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                      </button>
                    ) : c.header}
                  </th>
                ))}
              </tr></thead>
              <tbody>
                {slice.map((r) => (
                  <tr key={getId(r)} className="border-b last:border-0 hover:bg-muted/40">
                    {columns.map((c, i) => (
                      <td key={c.key} className={cn("tnum px-3 py-2.5", c.className)}>
                        {i === 0 && rowLink ? <Link to={rowLink(r)} className="font-medium text-primary hover:underline">{c.cell(r)}</Link> : c.cell(r)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y md:hidden">
            {slice.map((r) => (
              <li key={getId(r)} className="space-y-1.5 p-3">
                {columns.filter((c) => !c.mobileHidden).map((c, i) => (
                  <div key={c.key} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-xs text-muted-foreground">{c.header}</span>
                    {i === 0 && rowLink ? <Link to={rowLink(r)} className="text-right font-medium text-primary">{c.cell(r)}</Link> : <span className="tnum text-right">{c.cell(r)}</span>}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <span className="tnum">{filtered.length} registros · página {cur + 1} de {pages}</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="size-7" aria-label="Página anterior" disabled={cur === 0} onClick={() => setPage(cur - 1)}><ChevronLeft /></Button>
          <Button variant="ghost" size="icon" className="size-7" aria-label="Próxima página" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}><ChevronRight /></Button>
        </div>
      </div>
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: readonly T[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border bg-card p-0.5">
      {options.map((o) => (
        <button key={o} role="radio" aria-checked={value === o} type="button" onClick={() => onChange(o)}
          className={cn("rounded px-2.5 py-1 text-xs font-medium transition-colors", value === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{o}</button>
      ))}
    </div>
  );
}
