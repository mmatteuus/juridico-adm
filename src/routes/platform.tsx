import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { AccessDenied, PageSkeleton } from "@/components/admin/kit";
import { useDemo } from "@/features/demo/store";
import { canAccess, sectionFromPath } from "@/features/demo/roles";

export const Route = createFileRoute("/platform")({
  head: () => ({ meta: [{ title: "JURIDO SuperAdmin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PlatformLayout,
});

function PlatformLayout() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const signedIn = useDemo((s) => s.signedIn);
  const role = useDemo((s) => s.role);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  useEffect(() => { if (mounted && !signedIn) navigate({ to: "/" }); }, [mounted, signedIn, navigate]);
  if (!mounted || !signedIn) return <div className="p-8"><PageSkeleton /></div>;
  return <AdminAppShell>{canAccess(role, sectionFromPath(path)) ? <Outlet /> : <AccessDenied />}</AdminAppShell>;
}
