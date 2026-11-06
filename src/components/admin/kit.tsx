import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Inbox, Lock, Search, ServerCrash, WifiOff, X } from "lucide-react";
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
import { createDemoCsv, matchesSearch } from "@/features/demo/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  convite_pendente: "warning", expirada: "warning",
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
    <div className="mb-6 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, actions, children, className }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 rounded-[var(--radius)] border bg-card shadow-[var(--shadow-card)]", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
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
  return <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">{children}</div>;
}

/* ---------- Metric card ---------- */
export function MetricCard({ label, value, unit, delta, spark, status = "demo", source = "Fixture local", to, hint }: {
  label: string; value: string | number | null; unit?: string; delta?: number; spark?: number[]; status?: MetricStatus; source?: string; to?: string; hint?: string;
}) {
  const unavailable = status === "unavailable" || value === null;
  const body = (
    <div className={cn("group relative flex h-full flex-col gap-2 overflow-hidden rounded-[var(--radius)] border bg-card p-3 sm:p-4 shadow-[var(--shadow-card)] transition-all", to && "hover:-translate-y-px hover:border-primary/40 hover:shadow-[var(--shadow-raised)]")}>
      <div className="flex items-center justify-between">
        <span className="min-w-0 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">{label}</span>
      </div>
      {unavailable ? (
        <div className="flex items-center gap-2 py-1 text-sm font-medium text-destructive"><WifiOff className="size-4" /> Fonte indisponível — sem valor</div>
      ) : (
        <div className="flex items-end justify-between gap-2">
          <div className="tnum min-w-0 truncate text-lg font-semibold tracking-tight sm:text-2xl">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
          </div>
          {spark && <span className="hidden sm:block"><Sparkline data={spark} /></span>}
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
  return to ? <Link to={to} className="block rounded-[var(--radius)]" aria-label={`${label}: abrir detalhes`}>{body}</Link> : body;
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 64},${22 - ((v - min) / (max - min || 1)) * 20}`).join(" ");
  return <svg width="64" height="24" aria-hidden className="shrink-0 text-primary"><polygon points={`0,24 ${pts} 64,24`} fill="currentColor" opacity="0.1" /><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}

/* ---------- Charts ---------- */
const TT = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, boxShadow: "var(--shadow-raised)" };
const compact = (v: number) => Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v);
const fmtVal = (v: number, unit: string) => (v == null ? "sem dado" : unit === "R$" ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) : `${v.toLocaleString("pt-BR")} ${unit}`);
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
              <BarChart data={shown}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" width={52} tickLine={false} axisLine={false} tickFormatter={(v) => compact(v)} /><Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={TT} formatter={(v) => [fmtVal(v as number, unit), title]} /><Bar isAnimationActive={false} dataKey="value" fill="var(--chart-1)" radius={[3, 3, 0, 0]} /></BarChart>
            ) : type === "line" ? (
              <LineChart data={shown}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" width={52} tickLine={false} axisLine={false} tickFormatter={(v) => compact(v)} /><Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={TT} formatter={(v) => [fmtVal(v as number, unit), title]} /><Line isAnimationActive={false} dataKey="value" stroke="var(--chart-2)" strokeWidth={2} dot={false} /></LineChart>
            ) : (
              <AreaChart data={shown}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" width={52} tickLine={false} axisLine={false} tickFormatter={(v) => compact(v)} /><Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={TT} formatter={(v) => [fmtVal(v as number, unit), title]} /><Area isAnimationActive={false} dataKey="value" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.12} strokeWidth={2} /></AreaChart>
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
        <dl className="grid grid-cols-[90px_1fr] gap-x-3 sm:grid-cols-[110px_1fr] gap-y-1.5 rounded-md bg-muted p-3 text-sm">
          <dt className="text-muted-foreground">Objeto</dt><dd className="min-w-0 break-words font-medium">{object}</dd>
          <dt className="text-muted-foreground">Operação</dt><dd className="min-w-0 break-words">{operation}</dd>
          <dt className="text-muted-foreground">Impacto</dt><dd className="min-w-0 break-words">{impact}</dd>
        </dl>
        {children}
        <div className="space-y-1.5">
          <Label htmlFor="justificativa">Justificativa obrigatória</Label>
          <Textarea id="justificativa" value={reason} onChange={(e) => setReason(e.target.value)} onBlur={() => setTouched(true)} aria-invalid={touched && invalid} aria-describedby="just-help" placeholder="Descreva o motivo (mín. 10 caracteres)" />
          <p id="just-help" className={cn("text-xs", touched && invalid ? "text-destructive" : "text-muted-foreground")}><span className="flex justify-between gap-2"><span>{touched && invalid ? "Informe ao menos 10 caracteres." : "Registrada na trilha de auditoria simulada."}</span><span className="tnum">{reason.trim().length}/10</span></span></p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant={destructive ? "destructive" : "default"} disabled={invalid} onClick={() => { onConfirm(reason.trim()); onOpenChange(false); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Resource table ---------- */
export interface Column<T> { key: string; header: string; cell: (row: T) => ReactNode; sort?: (row: T) => string | number; exportValue?: (row: T) => string | number; className?: string; mobileHidden?: boolean }
export function ResourceTable<T>({ rows, columns, searchKeys, statusKey, statusOptions, rowLink, pageSize = 10, csvName, emptyText, toolbar, getId }: {
  rows: T[]; columns: Column<T>[]; searchKeys: (row: T) => string; statusKey?: (row: T) => string; statusOptions?: string[];
  rowLink?: (row: T) => string; pageSize?: number; csvName?: string; emptyText?: string; toolbar?: ReactNode; getId: (row: T) => string;
}) {
  const [q, setQ] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(pageSize);
  const hasFilters = q.length > 0 || statuses.length > 0;
  const clearFilters = () => { setQ(""); setStatuses([]); setPage(0); };
  const filtered = useMemo(() => {
    let out = rows.filter((r) => matchesSearch(searchKeys(r), q));
    if (statusKey && statuses.length) out = out.filter((r) => statuses.includes(statusKey(r)));
    if (sort) { const col = columns.find((c) => c.key === sort.key); if (col?.sort) { const f = col.sort; out = [...out].sort((a, b) => { const x = f(a), y = f(b); return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "pt-BR", { numeric: true })) * sort.dir; }); } }
    return out;
  }, [rows, q, statuses, sort, columns, searchKeys, statusKey]);
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const cur = Math.min(page, pages - 1);
  const slice = filtered.slice(cur * size, cur * size + size);

  const exportCsv = () => {
    const exported = columns.filter((c) => c.exportValue || c.sort);
    const body = filtered.map((r) => exported.map((c) => c.exportValue?.(r) ?? c.sort?.(r) ?? ""));
    const blob = new Blob([createDemoCsv(exported.map((c) => c.header), body)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${csvName ?? "export"}-demo.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-w-0 rounded-[var(--radius)] border bg-card shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-2 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input type="search" aria-label="Buscar na tabela" placeholder="Buscar…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} className="h-9 pl-8 pr-9" />
            {q && <Button type="button" variant="ghost" size="icon" className="absolute right-0.5 top-0.5 size-8" aria-label="Limpar busca" onClick={() => { setQ(""); setPage(0); }}><X /></Button>}
          </div>
          {statusOptions?.map((s) => {
            const on = statuses.includes(s);
            return (
              <Button key={s} type="button" size="sm" variant="outline" aria-pressed={on} onClick={() => { setStatuses(on ? statuses.filter((x) => x !== s) : [...statuses, s]); setPage(0); }}
                className={cn("h-7 px-2.5 capitalize shadow-none", on && "border-primary bg-accent text-accent-foreground")}>
                {LABELS[s] ?? s.replace(/_/g, " ")}
              </Button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">{hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X /> Limpar filtros</Button>}{toolbar}{csvName && <Button variant="outline" size="sm" disabled={!filtered.length} onClick={exportCsv}><Download /> CSV (fixture)</Button>}</div>
      </div>
      {slice.length === 0 ? <EmptyState title="Nenhum resultado" text={emptyText ?? "Ajuste a busca ou os filtros."} action={hasFilters ? <Button variant="outline" size="sm" onClick={clearFilters}><X /> Limpar filtros</Button> : undefined} /> : (
        <>
          <div className="scrollbar-thin hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10"><tr className="border-b bg-muted text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                {columns.map((c) => (
                  <th key={c.key} scope="col" aria-sort={c.sort ? sort?.key === c.key ? sort.dir === 1 ? "ascending" : "descending" : "none" : undefined} className={cn("px-3 py-2 font-medium", c.className)}>
                    {c.sort ? (
                      <Button type="button" variant="ghost" className="h-auto justify-start gap-1 rounded-sm p-0 text-[11px] font-medium uppercase hover:bg-transparent" onClick={() => { setSort(sort?.key === c.key ? { key: c.key, dir: sort.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 }); setPage(0); }}>
                        {c.header}{sort?.key === c.key && (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                      </Button>
                    ) : c.header}
                  </th>
                ))}
              </tr></thead>
              <tbody>
                {slice.map((r) => (
                  <tr key={getId(r)} className="border-b last:border-0 hover:bg-muted/40">
                    {columns.map((c, i) => (
                      <td key={c.key} className={cn("tnum whitespace-nowrap px-3 py-2.5", c.className)}>
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
              <li key={getId(r)} className="space-y-2 p-3">
                <div className="min-w-0 text-sm font-medium">{rowLink ? <Link to={rowLink(r)} className="block truncate text-primary">{columns[0].cell(r)}</Link> : columns[0].cell(r)}</div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {columns.slice(1).filter((c) => !c.mobileHidden).map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-[11px] text-muted-foreground">{c.header}</dt>
                      <dd className="tnum break-words text-sm">{c.cell(r)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
        <span className="tnum" role="status">{filtered.length ? `${cur * size + 1}–${Math.min((cur + 1) * size, filtered.length)} de ${filtered.length}` : "0"} registros{hasFilters && ` · ${rows.length} no total`}</span>
        <div className="flex items-center gap-2">
          <Select value={String(size)} onValueChange={(v) => { setSize(Number(v)); setPage(0); }}>
            <SelectTrigger aria-label="Registros por página" className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{[...new Set([pageSize, 10, 25, 50])].sort((a, b) => a - b).map((n) => <SelectItem key={n} value={String(n)}>{n} por página</SelectItem>)}</SelectContent>
          </Select>
          <span className="tnum">{cur + 1}/{pages}</span>
          <Button variant="ghost" size="icon" className="size-7" aria-label="Página anterior" disabled={cur === 0} onClick={() => setPage(cur - 1)}><ChevronLeft /></Button>
          <Button variant="ghost" size="icon" className="size-7" aria-label="Próxima página" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}><ChevronRight /></Button>
        </div>
      </div>
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: readonly T[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="scrollbar-thin inline-flex max-w-full overflow-x-auto rounded-md border bg-card p-0.5">
      {options.map((o) => (
        <Button key={o} role="radio" aria-checked={value === o} type="button" variant="ghost" size="sm" onClick={() => onChange(o)}
          className={cn("h-7 shrink-0 whitespace-nowrap rounded px-2.5 text-xs font-medium", value === o ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{o}</Button>
      ))}
    </div>
  );
}
