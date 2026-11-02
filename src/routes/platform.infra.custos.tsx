import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/admin/kit";

export const Route = createFileRoute("/platform/infra/custos")({
  head: () => ({ meta: [{ title: "Custos — JURIDO SuperAdmin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Custos" description="Módulo em construção (DEMO)." />
      <EmptyState title="Em breve" text="Esta tela será concluída na próxima etapa." />
    </>
  );
}
