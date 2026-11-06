import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageSkeleton, KpiGrid, MetricCard, ResourceTable, StatusBadge, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label } from "@/components/admin/kit";
import { useDemo, actions } from "@/features/demo/store";
import { DeveloperApp } from "@/features/demo/types";

export const Route = createFileRoute("/platform/developers")({
  head: () => ({ meta: [
    { title: "Developers — JURIDO SuperAdmin" },
    { name: "description", content: "Gerenciamento de API keys, webhooks e credenciais de desenvolvedor." },
    { property: "og:title", content: "Developers — JURIDO SuperAdmin" },
    { property: "og:description", content: "Gerenciamento de API keys, webhooks e credenciais de desenvolvedor." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Developers,
});

function Developers() {
  const loading = useDemo((s) => s);
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [scopes, setScopes] = React.useState("");

  const submit = () => {
    actions.createDevApp?.(name, scopes.split(",").map((s) => s.trim()));
    setOpen(false);
    setName("");
    setScopes("");
  };

  return (
    <>
      <PageHeader title="Developers" description="API keys, webhooks e credenciais de integração." />
      <KpiGrid>
        <MetricCard label="Apps" value={s.devApps.length} />
        <MetricCard label="Webhooks" value={s.devApps.reduce((a, a) => a + (a.webhooks?.length ?? 0), 0)} />
      </KpiGrid>
      <div className="mt-4">
        <ResourceTable<DeveloperApp>
          rows={s.devApps}
          getId={(a) => a.id}
          csvName="developer-apps"
          rowLink={(a) => `/platform/developers/${a.id}`}
          searchKeys={(a) => `${a.name} ${a.scopes.join(",")}`}
          statusKey={(a) => a.status}
          statusOptions={["planejado", "ativo", "revogado"]}
          columns={[
            { key: "n", header: "Nome", cell: (a) => a.name, sort: (a) => a.name },
            { key: "s", header: "Escopos", cell: (a) => a.scopes.join(", "), sort: (a) => a.scopes.join(",") },
            { key: "q", header: "Quota/dia", cell: (a) => a.quotaPerDay, sort: (a) => a.quotaPerDay },
            { key: "st", header: "Status", cell: (a) => <StatusBadge status={a.status} />, sort: (a) => a.status },
          ]}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-2">Criar app</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo aplicativo de desenvolvedor</DialogTitle>
              <DialogDescription>Defina o nome e os escopos (separados por vírgula).</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="MeuApp" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scopes">Escopos</Label>
                <Input id="scopes" value={scopes} onChange={(e) => setScopes(e.target.value)} placeholder="read,write" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
