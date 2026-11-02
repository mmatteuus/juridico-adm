import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { ActivityTimeline, ConfirmationDialog, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { actions, fmtDateTime, useDemo } from "@/features/demo/store";
import { STAFF_NAMES } from "@/features/demo/fixtures";
import type { SupportTicket } from "@/features/demo/types";

export const Route = createFileRoute("/platform/suporte/$id")({
  head: () => ({ meta: [{ title: "Chamado — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: TicketDetail,
});

const sel = "h-9 w-full rounded-md border bg-background px-2 text-sm";

function TicketDetail() {
  const { id } = Route.useParams();
  const t = useDemo((s) => s.tickets.find((x) => x.id === id));
  const tenant = useDemo((s) => s.tenants.find((x) => x.id === t?.tenantId));
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"nota" | "resposta">("nota");
  const [access, setAccess] = useState(false);
  const [close, setClose] = useState(false);
  if (!t) return <EmptyState title="Chamado não encontrado" action={<Button asChild variant="outline"><Link to="/platform/suporte">Voltar</Link></Button>} />;
  const closed = t.status === "encerrado";
  const send = () => {
    if (note.trim().length < 3) return;
    actions.ticketEvent(id, mode, note.trim()); setNote("");
    toast.success(mode === "nota" ? "Nota interna adicionada" : "Resposta registrada (nenhum e-mail enviado)");
  };
  return (
    <>
      <Link to="/platform/suporte" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Suporte</Link>
      <PageHeader title={`${t.id} — ${t.subject}`} description={`${tenant?.displayName ?? t.tenantId} · aberto em ${fmtDateTime(t.createdAt)}`} actions={<><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Linha do tempo">
            <ActivityTimeline items={t.history.map((h) => ({ id: h.id, when: fmtDateTime(h.when), title: h.text, meta: `${h.kind} · ${h.actor}`, tone: h.kind === "acesso" ? "warning" : undefined }))} />
          </Panel>
          {!closed && <Panel title="Responder">
            <div className="mb-2 flex gap-2">{(["nota", "resposta"] as const).map((m) => <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)}>{m === "nota" ? "Nota interna" : "Resposta ao escritório"}</Button>)}</div>
            <Label htmlFor="msg" className="sr-only">Mensagem</Label>
            <Textarea id="msg" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sem dados jurídicos, documentos ou informações de clientes finais." />
            <div className="mt-2 flex justify-end"><Button disabled={note.trim().length < 3} onClick={send}>Registrar</Button></div>
          </Panel>}
        </div>
        <div className="space-y-4">
          <Panel title="Gestão">
            <div className="space-y-3">
              <div className="space-y-1.5"><Label htmlFor="as">Responsável</Label><select id="as" className={sel} disabled={closed} value={t.assigneeId ?? ""} onChange={(e) => { actions.ticketEvent(id, "atribuicao", `Atribuído a ${e.target.value}`, { assigneeId: e.target.value }); toast.success("Chamado atribuído"); }}><option value="" disabled>Selecionar…</option>{STAFF_NAMES.map((n) => <option key={n}>{n}</option>)}</select></div>
              <div className="space-y-1.5"><Label htmlFor="st">Status</Label><select id="st" className={sel} disabled={closed} value={t.status} onChange={(e) => { const v = e.target.value as SupportTicket["status"]; actions.ticketEvent(id, "status", `Status alterado para ${v}`, { status: v }); toast.success("Status atualizado"); }}>{["aberto", "em_andamento", "aguardando", "resolvido"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}{closed && <option value="encerrado">encerrado</option>}</select></div>
              {!closed && <Button variant="destructive" className="w-full" onClick={() => setClose(true)}>Encerrar chamado</Button>}
            </div>
          </Panel>
          <Panel title="Diagnóstico">
            <dl className="space-y-1 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">requestId</dt><dd><code className="text-xs">{t.requestId}</code></dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Categoria</dt><dd>{t.category}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">SLA (demo)</dt><dd>{fmtDateTime(t.slaDueAt)}</dd></div></dl>
            <p className="mt-2 text-xs text-muted-foreground">requestId fictício — não há logs reais conectados.</p>
          </Panel>
          <Panel title="Acesso excepcional">
            <p className="mb-3 flex gap-2 text-xs text-muted-foreground"><Lock className="mt-0.5 size-3.5 shrink-0" />O suporte não abre documentos. Um acesso excepcional exigiria aprovação do gestor do escritório (fluxo futuro).</p>
            <Button variant="outline" className="w-full" disabled={closed} onClick={() => setAccess(true)}>Solicitar acesso excepcional (mock)</Button>
          </Panel>
        </div>
      </div>
      <ConfirmationDialog open={access} onOpenChange={setAccess} title="Solicitar acesso excepcional" object={t.id} operation="Pedido de acesso ao gestor do escritório" impact="Apenas registra o pedido. Nenhum acesso é concedido nesta demonstração." onConfirm={(r) => { actions.ticketEvent(id, "acesso", `Acesso excepcional solicitado: ${r}`); toast.success("Pedido registrado (DEMO)"); }} />
      <ConfirmationDialog open={close} onOpenChange={setClose} destructive title="Encerrar chamado" object={t.id} operation="Encerramento" impact="O chamado fica somente leitura; histórico preservado." confirmLabel="Encerrar" onConfirm={(r) => { actions.ticketEvent(id, "status", `Encerrado: ${r}`, { status: "encerrado" }); toast.success("Chamado encerrado"); }} />
    </>
  );
}
