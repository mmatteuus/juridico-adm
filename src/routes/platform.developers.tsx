import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ChartPanel, ConfirmationDialog, DemoDataBadge, KpiGrid, MetricCard, PageHeader, PageSkeleton, Panel, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { actions, useDemo } from "@/features/demo/store";

export const Route = createFileRoute("/platform/developers")({
  head: () => ({ meta: [{ title: "Developer Platform — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: Developers,
});

const SCOPES = ["tenants:read", "invoices:read", "calendar:read", "calendar:write", "metrics:read", "webhooks:manage"];

function Developers() {
  const loading = useFakeLoading();
  const apps = useDemo((s) => s.devApps);
  const [sel, setSel] = useState<string | null>(null);
  const [revoke, setRevoke] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [scopes, setScopes] = useState<string[]>([]);
  if (loading) return <PageSkeleton />;
  const app = apps.find((a) => a.id === sel);
  const total = apps.reduce((a, x) => a + x.requests7d.reduce((b, c) => b + c, 0), 0);
  return (
    <>
      <PageHeader title="Developer Platform" description="Planejamento da API pública para terceiros. Nenhuma chave real é gerada." actions={<Button onClick={() => setOpen(true)}><Plus /> Cadastrar app (fictício)</Button>} />
      <KpiGrid>
        <MetricCard label="Apps de terceiros" value={apps.length} />
        <MetricCard label="Ativos" value={apps.filter((a) => a.status === "ativo").length} />
        <MetricCard label="Requisições (7 dias)" value={total.toLocaleString("pt-BR")} />
        <MetricCard label="API v1" value="Planejada" hint="/api/v1/platform/…" />
      </KpiGrid>
      <Panel title="Aplicações" className="mt-4">
        <ul className="divide-y text-sm">{apps.map((a) => <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><button className="text-left font-medium text-primary hover:underline" onClick={() => setSel(a.id)}>{a.name}<span className="block text-xs font-normal text-muted-foreground">{a.owner} · {a.scopes.length} scopes</span></button><StatusBadge status={a.status} /></li>)}</ul>
      </Panel>
      <Panel title="Documentação (simulada)" className="mt-4" actions={<DemoDataBadge />}>
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{`GET /api/v1/platform/tenants        scope: tenants:read
GET /api/v1/platform/invoices       scope: invoices:read
POST /api/v1/webhooks               scope: webhooks:manage
Authorization: Bearer <chave ilustrativa — não existe>`}</pre>
      </Panel>
      <Sheet open={!!app} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {app && <>
            <SheetHeader><SheetTitle className="flex items-center gap-2">{app.name} <DemoDataBadge /></SheetTitle></SheetHeader>
            <div className="space-y-4 px-4 pb-6 text-sm">
              <StatusBadge status={app.status} />
              <div><p className="mb-1 text-xs text-muted-foreground">Scopes</p><div className="flex flex-wrap gap-1">{app.scopes.map((s) => <code key={s} className="rounded bg-muted px-1.5 py-0.5 text-xs">{s}</code>)}</div></div>
              <div><p className="text-xs text-muted-foreground">Credencial ilustrativa</p><code>{app.keyPreview}</code><p className="text-xs text-muted-foreground">Sem segredo real.</p></div>
              <p>Quota: <span className="tnum">{app.quotaPerDay.toLocaleString("pt-BR")}</span> req/dia · Webhooks: {app.webhooks.join(", ") || "nenhum"}</p>
              <ChartPanel title="Requisições (7 dias)" type="bar" height={160} data={app.requests7d.map((v, i) => ({ label: `D${i + 1}`, value: v }))} unit="req" source="Fixture" period="7d" />
              {app.status !== "revogado" && <Button variant="destructive" onClick={() => setRevoke(true)}>Simular revogação</Button>}
            </div>
          </>}
        </SheetContent>
      </Sheet>
      <ConfirmationDialog open={revoke} onOpenChange={setRevoke} destructive title="Revogar app" object={app?.name ?? ""} operation="Revogar credencial ilustrativa" impact="Métricas DEMO refletem bloqueio. Nenhuma chamada externa é feita." confirmLabel="Revogar" onConfirm={(r) => { actions.revokeDevApp(app!.id, r); toast.success("App revogado (DEMO)"); }} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastrar app <DemoDataBadge /></DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="an">Nome</Label><Input id="an" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <fieldset><legend className="mb-2 text-sm font-medium">Scopes</legend><div className="grid grid-cols-2 gap-2">{SCOPES.map((s) => <label key={s} className="flex items-center gap-2 text-sm"><Checkbox checked={scopes.includes(s)} onCheckedChange={(c) => setScopes(c ? [...scopes, s] : scopes.filter((x) => x !== s))} />{s}</label>)}</div></fieldset>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={name.trim().length < 3 || !scopes.length} onClick={() => { actions.createDevApp(name.trim(), scopes); toast.success("App planejado criado — credencial ilustrativa"); setOpen(false); setName(""); setScopes([]); }}>Cadastrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
