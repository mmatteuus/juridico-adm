import type { Domain } from "./types";

export interface DemoState {
  version: 1;
  signedIn: boolean;
  role: RoleKey;
  sourceMode: SourceMode;
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
  audit: AuditEvent[];
  notifications: Notification[];
  planHistory: { tenantId: string; from: string; to: string; when: string; reason: string }[];
  domains?: Domain[];
}

  // ...existing actions omitted for brevity...
  createDomain: (id: string, domain: string, tenantId: string, status: string) => set((s) => {
    s.domains = s.domains ?? [];
    s.domains.push({ id, domain, tenantId, status, createdAt: nowIso() });
    audit(s, "domain.create", "domain", id, `Domínio ${domain} adicionado`);
  }),
};