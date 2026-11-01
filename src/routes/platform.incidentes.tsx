import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/admin/kit";

export const Route = createFileRoute("/platform/incidentes")({
  head: () => ({ meta: [{ title: "Incidentes — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Incidentes" description="Módulo em construção (DEMO)." />
      <EmptyState title="Em breve" text="Esta tela será concluída na próxima etapa." />
    </>
  );
}
