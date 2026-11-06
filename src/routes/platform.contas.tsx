import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ShieldCheck, ShieldOff, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog, KpiGrid, MetricCard, PageHeader, PageSkeleton, Panel, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, fmtDateTime, useDemo } from "@/features/demo/store";
import { ROLES } from "@/features/demo/roles";
import type { RoleKey, StaffMember } from "@/features/demo/types";

export const Route = createFileRoute("/platform/contas")({
  head: () => ({ meta: [
    { title: "Contas da equipe — JURIDO SuperAdmin" },
    { name: "description", content: "Contas internas, convites e sessões privilegiadas em demonstração." },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: TeamAccounts,
});

function TeamAccounts() {
  const loading = useFakeLoading();
  const staff = useDemo((s) => s.staff);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [accessTarget, setAccessTarget] = useState<StaffMember | null>(null);
  const [roleTarget, setRoleTarget] = useState<StaffMember | null>(null);
  const [sessionTarget, setSessionTarget] = useState<StaffMember | null>(null);
  const [mfaTarget, setMfaTarget] = useState<StaffMember | null>(null);
  const [roleChoice, setRoleChoice] = useState<RoleKey>("support");
  if (loading) return <PageSkeleton />;
  const active = staff.filter((m) => m.accessStatus === "ativo");
  const pending = staff.filter((m) => m.accessStatus === "convite_pendente");
  return <>
    <PageHeader title="Contas da equipe" description="Identidades privilegiadas da plataforma, convites e sessões. Papéis e ações são locais à demonstração; não enviamos convites nem aplicamos segurança real." actions={<Button onClick={() => setInviteOpen(true)}><Plus /> Convidar membro</Button>} />
    <KpiGrid>
      <MetricCard label="Contas ativas" value={active.length} hint="Acesso administrativo demonstrativo" />
      <MetricCard label="Convites pendentes" value={pending.length} hint="Nenhum e-mail foi enviado" />
      <MetricCard label="Sem MFA" value={active.filter((m) => !m.mfa).length} hint="MFA obrigatório antes de produção" />
      <MetricCard label="Sessões ativas" value={active.reduce((sum, m) => sum + m.sessions, 0)} />
    </KpiGrid>
    <Panel title="Identidades e acesso" className="mt-4">
      <ResourceTable<StaffMember> rows={staff} getId={(m) => m.id} csvName="contas-equipe" searchKeys={(m) => `${m.name} ${m.id} ${ROLES[m.role]}`} statusKey={(m) => m.accessStatus} statusOptions={["ativo", "convite_pendente", "suspenso"]} emptyText="Nenhuma conta corresponde aos filtros." columns={[
        { key: "name", header: "Membro", cell: (m) => <><span>{m.name}</span><span className="ml-2 text-xs text-muted-foreground">{m.id}</span></>, sort: (m) => m.name, exportValue: (m) => m.name },
        { key: "role", header: "Perfil", cell: (m) => ROLES[m.role], sort: (m) => m.role, exportValue: (m) => ROLES[m.role] },
        { key: "state", header: "Acesso", cell: (m) => <StatusBadge status={m.accessStatus} />, sort: (m) => m.accessStatus, exportValue: (m) => m.accessStatus },
        { key: "mfa", header: "MFA", cell: (m) => <StatusBadge status={m.mfa ? "habilitado" : "pendente"} tone={m.mfa ? "success" : "warning"} />, sort: (m) => m.mfa ? "1" : "0", exportValue: (m) => m.mfa ? "Habilitado" : "Pendente" },
        { key: "sessions", header: "Sessões", cell: (m) => m.sessions, sort: (m) => m.sessions },
        { key: "seen", header: "Último acesso", cell: (m) => fmtDateTime(m.lastSeen), sort: (m) => m.lastSeen, mobileHidden: true },
        { key: "actions", header: "Ações", cell: (m) => <div className="flex flex-wrap gap-1"><Button size="sm" variant="outline" onClick={() => { setRoleChoice(m.role); setRoleTarget(m); }}>Perfil</Button><Button size="sm" variant="outline" onClick={() => setMfaTarget(m)}>MFA</Button>{m.sessions > 0 && <Button size="sm" variant="outline" onClick={() => setSessionTarget(m)}>Revogar sessões</Button>}{m.accessStatus === "ativo" ? <Button size="sm" variant="outline" onClick={() => setAccessTarget(m)}><ShieldOff /> Suspender</Button> : <Button size="sm" variant="outline" onClick={() => setAccessTarget(m)}><ShieldCheck /> {m.accessStatus === "suspenso" ? "Reativar" : "Simular aceite"}</Button>}</div> },
      ]} toolbar={<p className="self-center text-xs text-muted-foreground">Gestão ilustrativa</p>} />
    </Panel>
    <Panel title="Regras de acesso privilegiado" className="mt-4">
      <ul className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
        <li><strong className="text-foreground">Menor privilégio.</strong> Papéis separam operações, suporte, financeiro, comercial e segurança.</li>
        <li><strong className="text-foreground">MFA obrigatório.</strong> Contas sem segundo fator devem ser regularizadas antes de qualquer ambiente real.</li>
        <li><strong className="text-foreground">Trilha preservada.</strong> Convites e mudanças simuladas aparecem na auditoria de segurança.</li>
      </ul>
    </Panel>
    <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    <ConfirmationDialog open={!!roleTarget} onOpenChange={(open) => !open && setRoleTarget(null)} title="Alterar perfil" object={roleTarget?.name ?? ""} operation="Mudar papel administrativo da equipe" impact="Altera a navegação desta conta somente na demonstração." onConfirm={(reason) => { actions.setStaffRole(roleTarget!.id, roleChoice, reason); toast.success("Perfil alterado na demonstração"); }}>
      <div className="space-y-1.5"><Label htmlFor="team-role">Novo perfil</Label><select id="team-role" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={roleChoice} onChange={(event) => setRoleChoice(event.target.value as RoleKey)}>{(Object.keys(ROLES) as RoleKey[]).map((key) => <option key={key} value={key}>{ROLES[key]}</option>)}</select></div>
    </ConfirmationDialog>
    <ConfirmationDialog open={!!sessionTarget} onOpenChange={(open) => !open && setSessionTarget(null)} destructive title="Revogar sessões" object={sessionTarget?.name ?? ""} operation="Encerrar sessões administrativas demonstrativas" impact="O contador local será zerado; nenhum dispositivo real será desconectado." confirmLabel="Revogar sessões" onConfirm={(reason) => { actions.revokeSessions(sessionTarget!.id, reason); toast.success("Sessões revogadas na demonstração"); }} />
    <ConfirmationDialog open={!!mfaTarget} onOpenChange={(open) => !open && setMfaTarget(null)} destructive={!!mfaTarget?.mfa} title={mfaTarget?.mfa ? "Desabilitar MFA demonstrativo" : "Habilitar MFA demonstrativo"} object={mfaTarget?.name ?? ""} operation={mfaTarget?.mfa ? "Marcar segundo fator como desabilitado" : "Marcar segundo fator como habilitado"} impact="Este controle só altera o indicador local e não ativa ou remove proteção real." confirmLabel={mfaTarget?.mfa ? "Desabilitar indicador" : "Habilitar indicador"} onConfirm={(reason) => { const enabled = !mfaTarget!.mfa; actions.setStaffMfa(mfaTarget!.id, enabled, reason); toast.success(enabled ? "MFA marcado como habilitado na demonstração" : "MFA marcado como desabilitado na demonstração"); }} />
    <ConfirmationDialog open={!!accessTarget} onOpenChange={(open) => !open && setAccessTarget(null)} title={accessTarget?.accessStatus === "ativo" ? "Suspender conta" : "Ativar conta na demonstração"} object={accessTarget?.name ?? ""} operation={accessTarget?.accessStatus === "ativo" ? "Revogar acesso e sessões locais da demonstração" : "Simular aceite do convite ou reativação local"} impact="A alteração existe somente na demonstração; nenhum acesso real será alterado." destructive={accessTarget?.accessStatus === "ativo"} confirmLabel={accessTarget?.accessStatus === "ativo" ? "Suspender conta" : "Ativar conta"} onConfirm={(reason) => { const status = accessTarget?.accessStatus === "ativo" ? "suspenso" : "ativo"; actions.setStaffAccessStatus(accessTarget!.id, status, reason); toast.success(status === "ativo" ? "Conta ativada na demonstração" : "Conta suspensa na demonstração"); }} />
  </>;
}

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<RoleKey>("support");
  const [touched, setTouched] = useState(false);
  const invalid = name.trim().length < 3;
  const close = (next: boolean) => { onOpenChange(next); if (!next) { setName(""); setRole("support"); setTouched(false); } };
  const create = () => {
    setTouched(true);
    if (invalid) return;
    actions.inviteStaff(name.trim(), role);
    toast.success("Convite fictício registrado; nenhum e-mail foi enviado");
    close(false);
  };
  return <Dialog open={open} onOpenChange={close}><DialogContent>
    <DialogHeader><DialogTitle className="flex items-center gap-2"><UserRoundPlus className="size-5" /> Convidar membro <StatusBadge status="DEMO" tone="warning" /></DialogTitle></DialogHeader>
    <p className="text-sm text-muted-foreground">O convite será apenas um registro local. Não informe e-mail ou dados pessoais reais.</p>
    <div className="space-y-1.5"><Label htmlFor="staff-name">Nome fictício</Label><Input id="staff-name" value={name} onChange={(event) => setName(event.target.value)} onBlur={() => setTouched(true)} aria-invalid={touched && invalid} aria-describedby="staff-name-help" placeholder="Ex.: Alex Operações" /><p id="staff-name-help" className="text-xs text-muted-foreground">{touched && invalid ? "Informe ao menos 3 caracteres." : "A conta será criada como convite pendente, sem sessão ou MFA."}</p></div>
    <div className="space-y-1.5"><Label htmlFor="staff-role">Perfil inicial</Label><select id="staff-role" value={role} onChange={(event) => setRole(event.target.value as RoleKey)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">{(Object.keys(ROLES) as RoleKey[]).map((key) => <option key={key} value={key}>{ROLES[key]}</option>)}</select></div>
    <DialogFooter><Button variant="outline" onClick={() => close(false)}>Cancelar</Button><Button disabled={invalid} onClick={create}>Registrar convite fictício</Button></DialogFooter>
  </DialogContent></Dialog>;
}
