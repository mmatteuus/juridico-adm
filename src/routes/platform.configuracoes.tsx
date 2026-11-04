import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { actions, useDemo } from "@/features/demo/store";
import { ROLES } from "@/features/demo/roles";

export const Route = createFileRoute("/platform/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: Config,
});

const INITIAL = { name: "Marina Okada", email: "operadora@jurido.demo", grace: 10, trial: 14, notifyIncidents: true, notifyBilling: true, notifyTickets: false };

function Config() {
  const role = useDemo((s) => s.role);
  const [f, setF] = useState(INITIAL);
  const [saved, setSaved] = useState(INITIAL);
  const errEmail = !/^\S+@\S+\.\S+$/.test(f.email);
  const errGrace = f.grace < 0 || f.grace > 60;
  const dirty = JSON.stringify(f) !== JSON.stringify(saved);
  return (
    <>
      <PageHeader title="Configurações" description="Preferências do operador e políticas comerciais demonstrativas." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Perfil do operador">
          <div className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="nm">Nome</Label><Input id="nm" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="em">E-mail institucional</Label><Input id="em" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={errEmail} />{errEmail && <p className="text-xs text-destructive">E-mail inválido.</p>}</div>
            <p className="text-sm text-muted-foreground">Perfil DEMO atual: {ROLES[role]}</p>
          </div>
        </Panel>
        <Panel title="Políticas comerciais (demonstrativas)">
          <div className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="gr">Período de regularização (dias)</Label><Input id="gr" type="number" value={f.grace} onChange={(e) => setF({ ...f, grace: Number(e.target.value) })} aria-invalid={errGrace} /><p className={errGrace ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>{errGrace ? "Entre 0 e 60." : "Janela contratual definitiva: [PENDENTE]."}</p></div>
            <div className="space-y-1.5"><Label htmlFor="tr">Duração do trial (dias)</Label><Input id="tr" type="number" value={f.trial} onChange={(e) => setF({ ...f, trial: Number(e.target.value) })} /></div>
          </div>
        </Panel>
        <Panel title="Notificações internas">
          <div className="space-y-3">{([["notifyIncidents", "Incidentes"], ["notifyBilling", "Inadimplência"], ["notifyTickets", "Tickets urgentes"]] as const).map(([k, l]) => <label key={k} className="flex items-center justify-between text-sm">{l}<Switch checked={f[k]} onCheckedChange={(c) => setF({ ...f, [k]: c })} /></label>)}</div>
        </Panel>
        <Panel title="Dados demonstrativos">
          <p className="mb-3 text-sm text-muted-foreground">Restaura todos os registros fictícios ao estado inicial.</p>
          <Button variant="outline" onClick={() => { actions.reset(); toast.success("Dados demonstrativos restaurados"); }}>Restaurar dados demonstrativos</Button>
        </Panel>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" disabled={!dirty} onClick={() => setF(saved)}>Cancelar</Button>
        <Button disabled={!dirty || errEmail || errGrace} onClick={() => { setSaved(f); toast.success("Preferências salvas localmente (DEMO)"); }}>Salvar</Button>
      </div>
    </>
  );
}
