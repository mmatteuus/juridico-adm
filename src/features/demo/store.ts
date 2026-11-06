// Local mock repository (DEMO). Swappable for a real API adapter later; UI reads via hooks.
import { useSyncExternalStore } from "react";
import * as F from "./fixtures";
import type {
  AppRelease, AuditEvent, CommissionEntry, DomainHealth, EntitlementGrant, Incident, Notification, PlanVersion,
  PlatformSettings, ProviderCostAllocation, QueueJob, Reseller, Result, RoleKey, SaasInvoice, StaffMember, SubscriptionSummary, SupportTicket, TenantSummary, ThirdPartyApp, TicketEvent,
} from "./types";
import type { Domain } from "./types";

export type SourceMode = "ok" | "partial" | "unavailable";

export interface DemoState {
  version: 1;
  signedIn: boolean;
  role: RoleKey;
  sourceMode: SourceMode;
  settings: PlatformSettings;
  tenants: TenantSummary[];
  plans: PlanVersion[];
  subscriptions: SubscriptionSummary[];
  invoices: SaasInvoice[];
  entitlements: EntitlementGrant[];
  resellers: Reseller[];
  commissions: CommissionEntry[];
  tickets: SupportTicket[];
  releases: AppRelease[];
  devApps: ThirdPartyApp[];
  incidents: Incident[];
  staff: StaffMember[];
  queueJobs: QueueJob[];
  domainHealth: DomainHealth[];
  providerCosts: ProviderCostAllocation[];
  providerBudgetMinor: number;
  audit: AuditEvent[];
  notifications: Notification[];
  planHistory: { tenantId: string; from: string; to: string; when: string; reason: string }[];
  domains?: Domain[];
}

const KEY = "jurido-superadmin-demo-v1";
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export function initialState(): DemoState {
  return clone({
    version: 1, signedIn: false, role: "owner", sourceMode: "ok", settings: F.PLATFORM_SETTINGS,
    tenants: F.TENANTS, plans: F.PLANS, subscriptions: F.SUBSCRIPTIONS, invoices: F.INVOICES,
    entitlements: F.ENTITLEMENTS, resellers: F.RESELLERS, commissions: F.COMMISSIONS, tickets: F.TICKETS,
    releases: F.RELEASES, devApps: F.DEV_APPS, incidents: F.INCIDENTS, staff: F.STAFF,
    queueJobs: F.QUEUE_JOBS, domainHealth: F.DOMAIN_HEALTH, providerCosts: F.PROVIDER_COSTS,
    providerBudgetMinor: F.MONTHLY_PROVIDER_BUDGET_MINOR, audit: F.AUDIT,
    notifications: F.NOTIFICATIONS, planHistory: [],
  } as DemoState);
}

let state: DemoState = initialState();
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1) {
        const defaults = initialState();
        state = {
          ...defaults,
          ...parsed,
          settings: { ...F.PLATFORM_SETTINGS, ...parsed.settings },
          staff: (parsed.staff ?? defaults.staff).map((member: StaffMember) => ({
            ...member,
            accessStatus: member.accessStatus ?? (member.active ? "ativo" : "suspenso"),
          })),
        };
      }
    }
  } catch { /* ignore corrupted demo storage */ }
}

function set(fn: (s: DemoState) => void) {
  const next = clone(state);
  fn(next);
  state = next;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

const SERVER = initialState();
export function useDemo<T>(sel: (s: DemoState) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => { hydrate(); return sel(state); },
    () => sel(SERVER),
  );
}
export const getState = () => state;

const nowIso = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

function audit(s: DemoState, action: string, objectType: string, objectId: string, reason?: string, outcome: AuditEvent["outcome"] = "simulado") {
  s.audit.unshift({ id: uid("au"), actorRole: s.role, action, objectType, objectId, when: nowIso(), outcome, reason });
}

/** Async adapter shape for future real APIs. */
export async function fetchResource<T>(sel: (s: DemoState) => T): Promise<Result<T>> {
  await new Promise((r) => setTimeout(r, 250));
  if (state.sourceMode === "unavailable") return { ok: false, error: "Fonte indisponível (simulado)", state: "unavailable" };
  return { ok: true, data: sel(state), state: state.sourceMode === "partial" ? "partial" : "success" };
}

export const actions = {
  signIn: (role: RoleKey) => set((s) => { s.signedIn = true; s.role = role; }),
  signOut: () => set((s) => { s.signedIn = false; }),
  setRole: (role: RoleKey) => set((s) => { s.role = role; }),
  setSourceMode: (m: SourceMode) => set((s) => { s.sourceMode = m; }),
  saveSettings: (settings: PlatformSettings) => set((s) => { s.settings = settings; audit(s, "platform.settings.update", "platform", "settings", "Preferências demonstrativas salvas"); }),
  reset: () => set((s) => { const keep = { signedIn: s.signedIn, role: s.role }; Object.assign(s, initialState(), keep); }),

  createTenant: (displayName: string, city: string, planId: string) => {
    const id = `tn-${200 + state.tenants.length}`;
    set((s) => {
      const plan = s.plans.find((p) => p.id === planId)!;
      s.tenants.unshift({ id, displayName, city, createdAt: nowIso(), status: "trial", planId, activeSeats: 1, seatLimit: plan.seatLimit, storageGb: 0, accountManager: "Marina Okada", nextBillingDate: nowIso() });
      s.subscriptions.unshift({ tenantId: id, planId, status: "trial", billingCycle: "mensal", startDate: nowIso(), nextInvoiceDate: nowIso(), mrrMinor: 0 });
      audit(s, "tenant.create", "tenant", id, "Cadastro demonstrativo");
    });
    return id;
  },
  changePlan: (tenantId: string, planId: string, reason: string) => set((s) => {
    const t = s.tenants.find((x) => x.id === tenantId)!;
    const plan = s.plans.find((p) => p.id === planId)!;
    s.planHistory.unshift({ tenantId, from: t.planId, to: planId, when: nowIso(), reason });
    t.planId = planId; t.seatLimit = plan.seatLimit;
    const sub = s.subscriptions.find((x) => x.tenantId === tenantId);
    if (sub) { sub.planId = planId; }
    audit(s, "subscription.change_plan", "tenant", tenantId, reason);
  }),
  setTenantStatus: (tenantId: string, status: TenantSummary["status"], reason: string) => set((s) => {
    const t = s.tenants.find((x) => x.id === tenantId)!; t.status = status;
    const sub = s.subscriptions.find((x) => x.tenantId === tenantId);
    if (sub) sub.status = status === "suspenso" ? "suspensa" : status === "cancelado" ? "cancelada" : status === "ativo" ? "ativa" : sub.status;
    audit(s, `tenant.${status}`, "tenant", tenantId, reason);
  }),
  grantEntitlement: (tenantId: string, featureKey: string, mode: EntitlementGrant["mode"], validUntil: string | undefined, reason: string) => set((s) => {
    const id = uid("en");
    s.entitlements.unshift({ id, tenantId, featureKey, mode, validUntil, reason, approvedBy: s.role, active: true, createdAt: nowIso() });
    audit(s, "entitlement.grant", "tenant", tenantId, `${featureKey}: ${reason}`);
  }),
  revokeEntitlement: (id: string, reason: string) => set((s) => {
    const e = s.entitlements.find((x) => x.id === id)!; e.active = false;
    audit(s, "entitlement.revoke", "tenant", e.tenantId, `${e.featureKey}: ${reason}`);
  }),
  createPlanVersion: (baseId: string, patch: Partial<PlanVersion>) => set((s) => {
    const base = s.plans.find((p) => p.id === baseId)!;
    const version = Math.max(...s.plans.filter((p) => p.name === base.name).map((p) => p.version)) + 1;
    s.plans.unshift({ ...base, ...patch, id: `${base.name.toLowerCase()}-v${version}`, version, status: "rascunho", effectiveFrom: nowIso(), pricingState: "to_define" });
    audit(s, "plan.new_version", "plan", base.id, `Nova versão v${version}`);
  }),
  payInvoice: (id: string) => set((s) => {
    const inv = s.invoices.find((x) => x.id === id)!;
    if (inv.status === "paga") return; // idempotent: never count twice
    inv.status = "paga"; inv.paidAt = nowIso();
    audit(s, "invoice.mark_paid", "invoice", id, "Pagamento confirmado (simulado)");
  }),
  refundInvoice: (id: string, reason: string) => set((s) => {
    const inv = s.invoices.find((x) => x.id === id)!;
    if (inv.status !== "paga") return;
    inv.status = "reembolsada";
    const cm = s.commissions.find((c) => c.invoiceRef === id && c.state !== "ajuste");
    if (cm) s.commissions.unshift({ id: uid("cm"), resellerId: cm.resellerId, invoiceRef: id, amountMinor: -cm.amountMinor, state: "ajuste", adjustmentRef: cm.id, createdAt: nowIso() });
    audit(s, "invoice.refund", "invoice", id, reason);
  }),
  createReseller: (name: string, type: Reseller["type"], region: string) => {
    const id = uid("rv");
    set((s) => {
      s.resellers.unshift({ id, name, type, region, status: "em_analise", contractVersion: type === "indicador" ? "IN-2026.2" : "RV-2026.1", goalTenants: 3, attributedTenants: [], leads: [] });
      audit(s, "reseller.create", "reseller", id);
    });
    return id;
  },
  addLead: (resellerId: string, company: string) => set((s) => {
    s.resellers.find((r) => r.id === resellerId)!.leads.unshift({ id: uid("ld"), company, stage: "novo" });
  }),
  attributeTenant: (resellerId: string, tenantId: string) => set((s) => {
    s.resellers.forEach((r) => { r.attributedTenants = r.attributedTenants.filter((t) => t !== tenantId); });
    s.resellers.find((r) => r.id === resellerId)!.attributedTenants.push(tenantId);
    const t = s.tenants.find((x) => x.id === tenantId)!; t.sourcePartnerId = resellerId;
    s.invoices.filter((i) => i.tenantId === tenantId && i.status === "paga").slice(0, 1).forEach((inv) => {
      if (!s.commissions.some((c) => c.invoiceRef === inv.id)) s.commissions.unshift({ id: uid("cm"), resellerId, invoiceRef: inv.id, amountMinor: Math.round(inv.amountMinor * 0.15), state: "prevista", createdAt: nowIso() });
    });
    audit(s, "reseller.attribute_tenant", "reseller", resellerId, tenantId);
  }),
  adjustCommission: (commissionId: string, reason: string) => set((s) => {
    const cm = s.commissions.find((c) => c.id === commissionId)!;
    if (s.commissions.some((c) => c.adjustmentRef === commissionId)) return;
    s.commissions.unshift({ id: uid("cm"), resellerId: cm.resellerId, invoiceRef: cm.invoiceRef, amountMinor: -cm.amountMinor, state: "ajuste", adjustmentRef: cm.id, createdAt: nowIso() });
    audit(s, "commission.adjust", "commission", commissionId, reason);
  }),
  createTicket: (tenantId: string, subject: string, category: SupportTicket["category"], priority: SupportTicket["priority"]) => {
    const id = `TCK-${4300 + state.tickets.length}`;
    set((s) => {
      s.tickets.unshift({ id, tenantId, subject, category, priority, status: "aberto", createdAt: nowIso(), slaDueAt: new Date(Date.now() + 864e5).toISOString(), requestId: `req_demo_${Math.random().toString(16).slice(2, 8)}`, history: [{ id: uid("h"), when: nowIso(), actor: "Operador (DEMO)", kind: "criado", text: "Chamado criado no painel." }] });
    });
    return id;
  },
  ticketEvent: (id: string, kind: TicketEvent["kind"], text: string, patch?: Partial<SupportTicket>) => set((s) => {
    const t = s.tickets.find((x) => x.id === id)!;
    Object.assign(t, patch);
    t.history.push({ id: uid("h"), when: nowIso(), actor: `${s.role} (DEMO)`, kind, text });
    if (kind === "acesso") audit(s, "support.exceptional_access_request", "ticket", id, text);
  }),
  revokeDevApp: (id: string, reason: string) => set((s) => {
    const a = s.devApps.find((x) => x.id === id)!; a.status = "revogado"; a.requests7d = [...a.requests7d.slice(0, 6), 0];
    audit(s, "developer_app.revoke", "app", id, reason);
  }),
  createDevApp: (name: string, scopes: string[]) => set((s) => {
    const id = uid("app");
    s.devApps.unshift({ id, name, owner: "Cadastro DEMO", scopes, quotaPerDay: 1000, requests7d: [0, 0, 0, 0, 0, 0, 0], status: "planejado", keyPreview: "jd_demo_••••" + id.slice(-4), webhooks: [] });
    audit(s, "developer_app.create", "app", id, "Credencial ilustrativa — sem segredo real");
  }),
  simulateRelease: (appId: AppRelease["appId"], bump: "patch" | "minor") => set((s) => {
    const cur = s.releases.find((r) => r.appId === appId)!;
    const [ma, mi, pa] = cur.semver.split(".").map(Number);
    const semver = bump === "minor" ? `${ma}.${mi + 1}.0` : `${ma}.${mi}.${pa + 1}`;
    s.releases.unshift({ ...cur, id: uid("rl"), semver, releasedAt: nowIso(), notes: "Release simulado — nada foi publicado", status: "saudavel" });
    audit(s, "release.simulate", "app", appId, semver);
  }),
  setStaffRole: (id: string, role: RoleKey, reason: string) => set((s) => {
    const m = s.staff.find((x) => x.id === id)!; m.role = role; audit(s, "staff.change_role", "staff", id, reason);
  }),
  setStaffMfa: (id: string, enabled: boolean, reason: string) => set((s) => {
    const member = s.staff.find((x) => x.id === id)!;
    member.mfa = enabled;
    audit(s, enabled ? "staff.mfa.enable_demo" : "staff.mfa.disable_demo", "staff", id, reason);
  }),
  inviteStaff: (name: string, role: RoleKey) => set((s) => {
    const id = uid("st");
    s.staff.unshift({ id, name, role, mfa: false, lastSeen: "", sessions: 0, active: false, accessStatus: "convite_pendente" });
    audit(s, "staff.invite", "staff", id, "Convite apenas visual — nenhum e-mail enviado");
  }),
  setStaffAccessStatus: (id: string, status: StaffMember["accessStatus"], reason: string) => set((s) => {
    const m = s.staff.find((x) => x.id === id)!;
    m.accessStatus = status;
    m.active = status === "ativo";
    if (status !== "ativo") m.sessions = 0;
    audit(s, `staff.${status}`, "staff", id, reason);
  }),
  revokeSessions: (id: string, reason: string) => set((s) => {
    const m = s.staff.find((x) => x.id === id)!; m.sessions = 0; audit(s, "session.revoke", "staff", id, reason);
  }),
  advanceIncident: (id: string) => set((s) => {
    const inc = s.incidents.find((x) => x.id === id)!;
    const order: Incident["status"][] = ["investigando", "mitigado", "monitorando", "resolvido"];
    const next = order[Math.min(order.indexOf(inc.status) + 1, 3)];
    inc.status = next; inc.timeline.push({ when: nowIso(), text: `Status alterado para ${next} (DEMO).` });
  }),
  reprocessQueue: (name: string) => set((s) => {
    const queue = s.queueJobs.find((item) => item.name === name);
    if (!queue || queue.deadLetterCount === 0) return;
    const processed = queue.deadLetterCount;
    queue.deadLetterCount = 0;
    queue.depth = Math.max(0, queue.depth - processed);
    queue.status = "saudavel";
    audit(s, "queue.reprocess_demo", "queue", name, `${processed} mensagens fictícias; nada foi executado`);
  }),
  readNotification: (id: string) => set((s) => { const n = s.notifications.find((x) => x.id === id); if (n) n.read = true; }),
  createDomain: (id: string, domain: string, tenantId: string, status: Domain["status"]) => set((s) => {
    s.domains = s.domains ?? [];
    s.domains.push({ id, domain, tenantId, status, createdAt: nowIso() });
    audit(s, "domain.create", "domain", id, `Domínio ${domain} adicionado`);
  }),
  readAll: () => set((s) => { s.notifications.forEach((n) => (n.read = true)); }),
};

// Derived, consistent metrics (single source for cards, tables and details)
export function financeTotals(s: Pick<DemoState, "invoices" | "subscriptions">) {
  const received = s.invoices.filter((i) => i.status === "paga").reduce((a, i) => a + i.amountMinor, 0);
  const refunded = s.invoices.filter((i) => i.status === "reembolsada").reduce((a, i) => a + i.amountMinor, 0);
  const overdue = s.invoices.filter((i) => i.status === "vencida").reduce((a, i) => a + i.amountMinor, 0);
  const open = s.invoices.filter((i) => i.status === "emitida").reduce((a, i) => a + i.amountMinor, 0);
  const fees = s.invoices.filter((i) => i.status === "paga").reduce((a, i) => a + i.feeMinor, 0);
  const mrr = s.subscriptions.filter((x) => x.status === "ativa" || x.status === "regularizacao").reduce((a, x) => a + x.mrrMinor, 0);
  return { received, refunded, overdue, open, fees, mrr, arr: mrr * 12 };
}

export const brl = (minor: number) => (minor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—");
export const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—");
