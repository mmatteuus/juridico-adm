import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageSkeleton, KpiGrid, MetricCard, Panel, Button, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Input, Label } from "@/components/admin/kit";
import { useDemo, actions } from "@/features/demo/store";

export const Route = createFileRoute("/platform/releases")({
  head: () => ({ meta: [
    { title: "Releases — JURIDO SuperAdmin" },
    { name: "description", content: "Changelog de releases de aplicações e botão de rollback (simulado)." },
    { property: "og:title", content: "Releases — JURIDO SuperAdmin" },
    { property: "og:description", content: "Changelog de releases de aplicações e botão de rollback (simulado)." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Releases,
});

function Releases() {
  const loading = useDemo((s) => s);
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;

  const [open, setOpen] = React.useState(false);
  const [appId, setAppId] = React.useState("");

  const submit = () => {
    actions.simulateRelease?.(appId, "minor"); // simple minor bump for demo
    setOpen(false);
  };

  return (
    <>
      <PageHeader title="Releases" description="Changelog de releases e simulação de rollback." />
      <KpiGrid>
        <MetricCard label="Releases" value={s.releases.length} />
        <MetricCard label="Apps" value={new Set(s.releases.map((r) => r.appId)).size} />
      </KpiGrid>
      <div className="mt-4 space-y-4">
        {s.releases.map((rel) => (
          <Panel key={rel.id} title={`${rel.appId} – v${rel.semver}`} description={rel.notes}>
            <div className="flex items-center justify-between">
              <span>{rel.releasedAt ? new Date(rel.releasedAt).toLocaleDateString("pt-BR") : "—"}</span>
              <Button variant="outline" onClick={() => { actions.simulateRelease?.(rel.appId, "patch"); }}>Rollback</Button>
            </div>
          </Panel>
        ))}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Simular nova release</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova release (simulada)</DialogTitle>
              <DialogDescription>Selecione o app para gerar um bump de versão menor.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <Label htmlFor="app">App ID</Label>
              <select id="app" value={appId} onChange={(e) => setAppId(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
                {Array.from(new Set(s.releases.map((r) => r.appId))).map((id) => <option key={id} value={id}>{id}</option>}
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit}>Criar release</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
