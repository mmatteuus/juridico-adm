import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, PageSkeleton, Panel, StatusBadge, useFakeLoading } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { actions, fmtDateTime, useDemo } from "@/features/demo/store";
import type { AppRelease } from "@/features/demo/types";

export const Route = createFileRoute("/platform/releases")({
  head: () => ({ meta: [
    { title: "Releases — JURIDO SuperAdmin" },
    { name: "description", content: "Versões independentes e histórico de releases demonstrativos dos aplicativos JURIDO." },
    { property: "og:title", content: "Releases — JURIDO SuperAdmin" },
    { property: "og:description", content: "Versões independentes e histórico de releases demonstrativos dos aplicativos JURIDO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Releases,
});

function Releases() {
  const loading = useFakeLoading();
  const releases = useDemo((s) => s.releases);
  const [app, setApp] = useState<AppRelease["appId"]>("platform-admin");
  if (loading) return <PageSkeleton />;
  const apps = [...new Set(releases.map((r) => r.appId))];
  const latest = apps.map((a) => releases.find((r) => r.appId === a)!);
  return (
    <>
      <PageHeader title="Apps e releases" description="Cada app tem versão e deploy independentes. Simulações não publicam nada." />
      <Panel title="Versão atual por app">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">app_id</th><th>Versão</th><th>Ambiente</th><th>Status</th><th>Último release</th><th>Deploy</th></tr></thead>
          <tbody>{latest.map((r) => <tr key={r.appId} className="border-b last:border-0"><td className="py-2"><code>{r.appId}</code></td><td className="tnum font-medium">{r.semver}</td><td>{r.environment}</td><td><StatusBadge status={r.status} /></td><td>{fmtDateTime(r.releasedAt)}</td><td>Independente</td></tr>)}</tbody></table></div>
      </Panel>
      <Panel title="Simular release" className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm">App <select aria-label="App" className="ml-2 h-9 rounded-md border bg-background px-2" value={app} onChange={(e) => setApp(e.target.value as AppRelease["appId"])}>{apps.map((a) => <option key={a}>{a}</option>)}</select></label>
          <Button variant="outline" onClick={() => { actions.simulateRelease(app, "patch"); toast.success(`Patch simulado em ${app} — outros apps inalterados`); }}>Simular patch</Button>
          <Button onClick={() => { actions.simulateRelease(app, "minor"); toast.success(`Minor simulado em ${app} — outros apps inalterados`); }}>Simular nova versão</Button>
        </div>
      </Panel>
      <Panel title={`Histórico de ${app}`} className="mt-4">
        <ul className="divide-y text-sm">{releases.filter((r) => r.appId === app).map((r) => <li key={r.id} className="flex justify-between py-2"><span><span className="tnum font-medium">{r.semver}</span> <span className="text-xs text-muted-foreground">{r.notes}</span></span><span className="text-xs text-muted-foreground">{fmtDateTime(r.releasedAt)}</span></li>)}</ul>
      </Panel>
    </>
  );
}
