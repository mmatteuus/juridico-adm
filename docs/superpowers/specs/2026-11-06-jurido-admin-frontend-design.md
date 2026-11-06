# JURIDO – Admin Front‑End Design Specification (2024‑11‑06)

## Overview

This document defines the remaining front‑end work needed for the **JURIDO SuperAdmin** web application. The back‑end (Neon PostgreSQL + Cloudflare) is out of scope; all UI work is confined to the demo / mock data layer and must respect the role‑based access control already in place.

### Goals

| Goal | Description |
|------|-------------|
| **Complete the admin UI** | Add or finish the pages/modules listed in the product vision (Vision 01) that are still missing from the code base. |
| **Consistency with existing UI** | Use the same component library (`kit`, `ui`) and styling (Tailwind 4) as the rest of the app. |
| **Respect role permissions** | Every page/element must be gated by `canAccess` and the existing `NAV` visibility logic. |
| **Demo‑only data** | All interactions use the demo store (`useDemo`, `actions.*`); no real API calls. |
| **Responsiveness** | Mobile‑first grid layouts; collapse to single‑column on narrow screens. |

### Out‑of‑Scope

* Backend integration (real Neon/Cloudflare endpoints).
* Office‑side (escritório) UI – already built or deferred.
* Authentication flow – demo mode only.
* Data persistence or migration.

## Pages / Modules to Build / Finish

| # | Route | Title (as shown in PageHeader) | Core UI / Data | Status |
|---|-------|-------------------------------|----------------|--------|
| 1 | `/platform/planos` | **Planos** – list all subscription plans, pricing details, “Selecionar” button per plan. | `PageHeader`, `KpiGrid`, `MetricCard`, `Dialog` to change a tenant’s plan. | **New** |
| 2 | `/platform/licencas` | **Licenças** – per‑tenant seat management (grant/revoke seats). | `PageHeader`, `ResourceTable<TenantLicense>`, `Dialog` for seat actions. | **New** |
| 3 | `/platform/assinaturas` | **Assinaturas** – view current subscription, billing cycle, next invoice, upgrade/downgrade flow. | `PageHeader`, `MetricCard`, `Dialog` for plan change (similar to tenant‑detail). | **New** |
| 4 | `/platform/revendedores` | **Revendedores** – list partners and commissions. | `PageHeader`, `ResourceTable<Reseller>`, `KpiGrid` (commission %). | **New** |
| 5 | `/platform/infra/filas` | **Filas** – Cloudflare Queue status, pending jobs, DLQ depth. | `PageHeader`, `KpiGrid`, `ChartPanel` (queue depth over time). | **New** |
| 6 | `/platform/infra/dominios` | **Domínios** – list configured custom domains, status (verified/pending). | `PageHeader`, `ResourceTable<Domain>`, `Dialog` add/remove (demo). | **New** |
| 7 | `/platform/seguranca` | **Segurança** – audit‑log viewer with date/ action filters. | `PageHeader`, `Tabs`, `ResourceTable`, `StatusBadge`. | **New** |
| 8 | `/platform/developers` | **Developer Platform** – API keys list, webhook registrations, token revocation. | `PageHeader`, `ResourceTable`, `Dialog` create revoke key. | **New** |
| 9 | `/platform/releases` | **Releases** – changelog list, deploy timestamps, roll‑back button (demo). | `PageHeader`, `Panel` with markdown‑style list. | **New** |
| 10 | `/platform/configuracoes` | **Configurações** – feature‑flag toggles, environment selector. | `PageHeader`, `Switch`, `Label`. | **New** |
| 11 | `/platform/escritorios/$id` | **Ficha do escritório** – already exists but missing polish (edit plan, suspend, add‑on modal). | Uses existing `TenantDetail`; add missing validation & UX refinements. | **Finish** |

### Component Re‑use (already in the codebase)

| Category | Components (imported from `@/components/...`) |
|----------|----------------------------------------------|
| Layout | `PageHeader`, `AdminAppShell`, `Breadcrumb` |
| Data display | `MetricCard`, `KpiGrid`, `ResourceTable`, `Panel`, `EmptyState`, `UnavailableState`, `StatusBadge` |
| Forms | `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `Input`, `Select`, `Label`, `Button` |
| Navigation | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Link` |
| Utilities | `cn` (class‑names), `brl` (currency format), `fmtDate`, `fmtDateTime` |

All new pages must import **only** these components; no new UI libraries are permitted.

### Data Flow (demo only)

1. **Read** – each page calls `useDemo(state => state.<module>)` to obtain the relevant slice (e.g., `plans`, `tenants`, `subscriptions`).  
2. **Write** – user actions (`onClick`, `onSubmit`) invoke the corresponding `actions.<verb>` defined in `src/features/demo/store.ts`. These actions mutate the in‑memory demo state and toast a success message (`toast.success`).  
3. **Re‑render** – the TanStack Router re‑loads the component, the demo state reflects the change, and the UI updates immediately.  

#### Example: Changing a tenant’s plan

```tsx
import { actions } from "@/features/demo/store";

const handleChangePlan = (tenantId: string, newPlanId: string) => {
  actions.changePlan(tenantId, newPlanId, (r) => {
    toast.success("Plano alterado (DEMO)");
  });
};
```

### Acceptance Criteria (per module)

| Criterion | Description |
|-----------|-------------|
| **Page exists** | Route renders without errors (Vite dev server start). |
| **Header correct** | `PageHeader` shows the correct title and description. |
| **Demo data loads** | Table/grid populates with at least one demo record. |
| **Role gating** | When `canAccess(role, "section")` returns `false`, the navigation item is hidden and the page returns a 404‑style `EmptyState` (“Acesso negado”). |
| **Action succeeds** | Clicking “Grant”, “Revoke”, “Change Plan”, etc., calls the demo action, shows a toast, and the UI updates (row count, badge, etc.). |
| **Responsive** | On viewport < 640 px the grid collapses to a single column (Tailwind `sm:grid-cols-1`). |
| **No console errors** | `npm run dev` shows no TypeScript or runtime errors. |

## Roles & Permissions (existing)

| Role | Sections visible (via `NAV`) |
|------|------------------------------|
| `superadmin` | All groups: Visão geral, Comercial, Operação, Infraestrutura, Governança |
| `gestor` | Visão geral, Comercial (partial), Operação (suporte, incidentes) |
| `analista` | Visão geral only |
| `visitante` | None (empty nav) |

All new pages must respect these same gates. The `canAccess` import pattern used elsewhere (e.g., `AdminAppShell.tsx` line 53) should be replicated.

## Test Coverage (minimal)

Each new page should have a **vitest + React Testing Library** test that:

1. Renders the page component.  
2. Verifies the `PageHeader` title matches the expected string.  
3. Clicks a primary action (e.g., “Novo escritório”, “Mudar plano”) and asserts `toast.success` was called.  
4. Checks that the table displays at least one row from `useDemo`.

Existing tests in `src/test/` can be used as a template.

## Implementation Phases (planned)

1. **Write this spec** (completed).  
2. **Generate detailed plan** via `writing-plans` skill (next step).  
3. **Dispatch parallel sub‑agents** (one per module) to implement the pages, dialogs, and tests.  
4. **Run `npm run dev`** to verify no errors.  
5. **Run `npm run test`** to confirm all new tests pass.  
6. **Commit & push** the changes to `main`.

---
*Document generated on 2026‑11‑06 as part of the “continue front‑end” goal for the JURIDO admin system.*