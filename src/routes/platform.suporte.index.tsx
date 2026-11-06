import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DemoDataBadge, KpiGrid, MetricCard, PageHeader, PageSkeleton, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, fmtDateTime, useDemo } from "@/features/demo/store";
import type { SupportTicket } from "@/features/demo/types";

export const Route = createFileRoute("/platform/suporte/")({
  head: () => ({ meta: [
    { title: "Suporte — JURIDO SuperAdmin" },
    { name: "description", content: "Chamados, prioridades e acompanhamento do suporte aos escritórios JURIDO." },
    { property: "og:title", content: "Suporte — JURIDO SuperAdmin" },
    { property: "og:description", content: "Chamados, prioridades e acompanhamento do suporte aos escritórios JURIDO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Suporte,
});

const sel = "h-9 w-full rounded-md border bg-background px-2 text-sm";

function Suporte() {
  const loading = useFakeLoading();
  const tickets = useDemo((s) => s.tickets);
  const tenants = useDemo((s) => s.tenants);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [cat, setCat] = useState<SupportTicket["category"]>("duvida");
  const [prio, setPrio] = useState<SupportTicket["priority"]>("media");
  const [touched, setTouched] = useState(false);
  if (loading) return <PageSkeleton />;
  const openT = tickets.filter((t) => !["resolvido", "encerrado"].includes(t.status));
  const name = (id: string) => tenants.find((t) => t.id === id)?.displayName ?? id;
  const err = subject.trim().length < 5;
  return (
    <>
      <PageHeader title="Central de suporte" description="Chamados dos escritórios. O suporte não visualiza autos, documentos nem clientes finais." actions={<Button onClick={() => setOpen(true)}><Plus /> Novo chamado</Button>} />
      <KpiGrid>
        <MetricCard label="Abertos" value={openT.length} />
        <MetricCard label="Urgentes" value={openT.filter((t) => t.priority === "urgente").length} />
        <MetricCard label="Sem responsável" value={openT.filter((t) => !t.assigneeId).length} />
        <MetricCard label="SLA vencido (demo)" value={openT.filter((t) => t.slaDueAt && new Date(t.slaDueAt) < new Date()).length} hint="SLA demonstrativo" />
      </KpiGrid>
      <div className="mt-4">
        <ResourceTable<SupportTicket> rows={tickets} getId={(t) => t.id} csvName="tickets" rowLink={(t) => `/platform/suporte/${t.id}`}
          searchKeys={(t) => `${t.id} ${t.subject} ${name(t.tenantId)}`} statusKey={(t) => t.priority} statusOptions={["urgente", "alta", "media", "baixa"]}
          columns={[
            { key: "id", header: "ID", cell: (t) => t.id, sort: (t) => t.id },
            { key: "sub", header: "Assunto", cell: (t) => t.subject, sort: (t) => t.subject },
            { key: "ten", header: "Escritório", cell: (t) => name(t.tenantId), sort: (t) => name(t.tenantId), mobileHidden: true },
            { key: "p", header: "Prioridade", cell: (t) => <StatusBadge status={t.priority} />, sort: (t) => ["urgente", "alta", "media", "baixa"].indexOf(t.priority), exportValue: (t) => t.priority },
            { key: "s", header: "Status", cell: (t) => <StatusBadge status={t.status} />, sort: (t) => t.status },
            { key: "c", header: "Categoria", cell: (t) => t.category, sort: (t) => t.category, mobileHidden: true },
            { key: "a", header: "Responsável", cell: (t) => t.assigneeId ?? "—", sort: (t) => t.assigneeId ?? "", mobileHidden: true },
            { key: "d", header: "Aberto em", cell: (t) => fmtDateTime(t.createdAt), sort: (t) => t.createdAt, mobileHidden: true },
          ]} />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo chamado <DemoDataBadge /></DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="sj">Assunto</Label><Input id="sj" value={subject} onChange={(e) => setSubject(e.target.value)} aria-invalid={touched && err} />{touched && err && <p className="text-xs text-destructive">Mínimo 5 caracteres.</p>}<p className="text-xs text-muted-foreground">Não inclua dados jurídicos ou de clientes finais.</p></div>
            <div className="space-y-1.5"><Label htmlFor="tn">Escritório</Label><select id="tn" className={sel} value={tenantId} onChange={(e) => setTenantId(e.target.value)}>{tenants.map((t) => <option key={t.id} value={t.id}>{t.displayName}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor="ct">Categoria</Label><select id="ct" className={sel} value={cat} onChange={(e) => setCat(e.target.value as SupportTicket["category"])}>{["acesso", "faturamento", "desempenho", "integracao", "duvida"].map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="space-y-1.5"><Label htmlFor="pr">Prioridade</Label><select id="pr" className={sel} value={prio} onChange={(e) => setPrio(e.target.value as SupportTicket["priority"])}>{["urgente", "alta", "media", "baixa"].map((c) => <option key={c}>{c}</option>)}</select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={() => { setTouched(true); if (err) return; const id = actions.createTicket(tenantId, subject.trim(), cat, prio); toast.success("Chamado criado (DEMO)"); setOpen(false); setSubject(""); setTouched(false); navigate({ to: "/platform/suporte/$id", params: { id } }); }}>Criar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
