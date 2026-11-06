import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageSkeleton, KpiGrid, MetricCard, Switch, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button } from "@/components/admin/kit";
import { useDemo, actions } from "@/features/demo/store";

export const Route = createFileRoute("/platform/configuracoes")({
  head: () => ({ meta: [
    { title: "Configurações — JURIDO SuperAdmin" },
    { name: "description", content: "Toggles de feature‑flags, seleção de ambiente e ajustes de demo." },
    { property: "og:title", content: "Configurações — JURIDO SuperAdmin" },
    { property: "og:description", content: "Toggles de feature‑flags, seleção de ambiente e ajustes de demo." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: Configuracoes,
});

function Configuracoes() {
  const loading = useDemo((s) => s);
  const s = useDemo((x) => x);
  if (loading) return <PageSkeleton />;

  const [open, setOpen] = React.useState(false);
  const [selectedMode, setSelectedMode] = React.useState(s.sourceMode);

  const apply = () => {
    actions.setSourceMode?.(selectedMode);
    setOpen(false);
  };

  return (
    <>
      <PageHeader title="Configurações" description="Ajustes de ambiente e feature‑flags (demo)." />
      <KpiGrid>
        <MetricCard label="Modo de fonte" value={s.sourceMode} />
        <MetricCard label="Feature demo" value={s.sourceMode === "ok" ? "ativa" : "desativada"} />
      </KpiGrid>
      <div className="mt-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Alterar modo de fonte</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecionar modo de fonte</DialogTitle>
              <DialogDescription>Escolha entre "ok", "partial" ou "unavailable" para simular diferentes estados de dados.</DialogDescription>
            </DialogHeader>
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger>
                <SelectValue placeholder="Modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ok">OK – dados disponíveis</SelectItem>
                <SelectItem value="partial">Parcial – dados incompletos</SelectItem>
                <SelectItem value="unavailable">Indisponível – fonte falha</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={apply}>Aplicar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
