import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog, KpiGrid, MetricCard, PageHeader, PageSkeleton, Panel, ResourceTable, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { actions, fmtDateTime, useDemo } from "@/features/demo/store";
import { ROLES } from "@/features/demo/roles";
import type { AuditEvent, RoleKey, StaffMember } from "@/features/demo/types";

export const Route = createFileRoute("/platform/seguranca")({
  head: () => ({ meta: [{ title: "Segurança — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: Seguranca,
});

function Seguranca() {
  const loading = useFakeLoading();
  const staff = useDemo((s) => s.staff);
  const audit = useDemo((s) => s.audit);
  const [roleOp, setRoleOp] = useState<StaffMember | null>(null);
  const [newRole, setNewRole] = useState<RoleKey>("support");
  const [sessOp, setSessOp] = useState<StaffMember | null>(null);
  if (loading) return <PageSkeleton />;
  return (
    <>
      <PageHeader title="Acessos e auditoria" description="Perfis da equipe da plataforma, sessões e trilha de auditoria (DEMO — sem segurança real)." />
      <KpiGrid>
        <MetricCard label="Membros da equipe" value={staff.length} />
        <MetricCard label="Sem MFA" value={staff.filter((m) => !m.mfa).length} hint="Exigido em produção" />
        <MetricCard label="Sessões ativas" value={staff.reduce((a, m) => a + m.sessions, 0)} />
        <MetricCard label="Eventos de auditoria" value={audit.length} />
      </KpiGrid>
      <Panel title="Equipe e perfis" className="mt-4">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Nome</th><th>Perfil</th><th>MFA</th><th>Sessões</th><th>Último acesso</th><th /></tr></thead>
          <tbody>{staff.map((m) => <tr key={m.id} className="border-b last:border-0"><td className="py-2 font-medium">{m.name}</td><td>{ROLES[m.role]}</td><td><StatusBadge status={m.mfa ? "ativo" : "inativo"} /></td><td className="tnum">{m.sessions}</td><td>{fmtDateTime(m.lastSeen)}</td>
            <td className="space-x-2 whitespace-nowrap text-right"><Button size="sm" variant="outline" onClick={() => { setNewRole(m.role); setRoleOp(m); }}>Alterar perfil</Button><Button size="sm" variant="destructive" disabled={!m.sessions} onClick={() => setSessOp(m)}>Revogar sessões</Button></td></tr>)}</tbody></table></div>
      </Panel>
      <Panel title="Break-glass (documentado)" className="mt-4">
        <p className="text-sm text-muted-foreground">Acesso emergencial exigirá dois aprovadores, MFA reforçado, janela de tempo limitada e registro completo. Nunca concede leitura de documentos jurídicos. Fluxo [PENDENTE] para produção.</p>
      </Panel>
      <div className="mt-4">
        <ResourceTable<AuditEvent> rows={audit} getId={(a) => a.id} csvName="auditoria" searchKeys={(a) => `${a.action} ${a.objectId} ${a.reason ?? ""}`} statusKey={(a) => a.actorRole} statusOptions={Object.keys(ROLES)}
          columns={[
            { key: "w", header: "Quando", cell: (a) => fmtDateTime(a.when), sort: (a) => a.when },
            { key: "ac", header: "Ação", cell: (a) => <code className="text-xs">{a.action}</code>, sort: (a) => a.action },
            { key: "o", header: "Objeto", cell: (a) => `${a.objectType}:${a.objectId}`, sort: (a) => a.objectId },
            { key: "r", header: "Perfil", cell: (a) => ROLES[a.actorRole], sort: (a) => a.actorRole, mobileHidden: true },
            { key: "out", header: "Resultado", cell: (a) => <StatusBadge status={a.outcome} tone="warning" />, sort: (a) => a.outcome },
            { key: "j", header: "Justificativa", cell: (a) => a.reason ?? "—", mobileHidden: true },
          ]} />
      </div>
      <ConfirmationDialog open={!!roleOp} onOpenChange={(o) => !o && setRoleOp(null)} title="Alterar perfil" object={roleOp?.name ?? ""} operation="Mudança de papel da equipe" impact="Altera as telas visíveis para este membro (simulado)." onConfirm={(r) => { actions.setStaffRole(roleOp!.id, newRole, r); toast.success("Perfil alterado (DEMO)"); }}>
        <div className="space-y-1.5"><Label htmlFor="nr">Novo perfil</Label><select id="nr" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={newRole} onChange={(e) => setNewRole(e.target.value as RoleKey)}>{(Object.keys(ROLES) as RoleKey[]).map((k) => <option key={k} value={k}>{ROLES[k]}</option>)}</select></div>
      </ConfirmationDialog>
      <ConfirmationDialog open={!!sessOp} onOpenChange={(o) => !o && setSessOp(null)} destructive title="Revogar sessões" object={sessOp?.name ?? ""} operation="Encerrar todas as sessões" impact="Revogação simulada; dispositivos offline só seriam afetados ao reconectar." confirmLabel="Revogar" onConfirm={(r) => { actions.revokeSessions(sessOp!.id, r); toast.success("Sessões revogadas (DEMO)"); }} />
    </>
  );
}
