// Domain DTOs for the JURIDO SuperAdmin prototype. All data is synthetic (DEMO).
export type Result<T> = { ok: true; data: T; state: "success" | "partial" } | { ok: false; error: string; state: "error" | "unavailable" };

export type RoleKey = "owner" | "ops" | "support" | "finance" | "sales" | "security";
export type TenantStatus = "ativo" | "trial" | "inadimplente" | "suspenso" | "cancelado";

export interface TenantSummary {
  id: string;
  displayName: string;
  city: string;
  createdAt: string;
  status: TenantStatus;
  planId: string;
  activeSeats: number;
  seatLimit: number;
  storageGb: number;
  sourcePartnerId?: string;
  accountManager: string;
  nextBillingDate: string;
}

export interface PlanVersion {
  id: string;
  name: string;
  version: number;
  effectiveFrom: string;
  features: string[];
  seatLimit: number;
  storageCapGb: number;
  apiCallsMonth: number;
  pricingState: "to_define";
  status: "ativo" | "rascunho" | "arquivado";
}

export interface Domain { id: string; domain: string; tenantId: string; status: "verified" | "pending" | "failed"; createdAt: string; }

export interface EntitlementGrant {
  id: string;
  tenantId: string;
  featureKey: string;
  mode: "plano" | "override" | "addon";
  validUntil?: string;
  reason: string;
  approvedBy: string;
  active: boolean;
  createdAt: string;
}

export interface SubscriptionSummary {
  tenantId: string;
  planId: string;
  status: "ativa" | "trial" | "regularizacao" | "suspensa" | "cancelada";
  billingCycle: "mensal" | "anual";
  startDate: string;
  nextInvoiceDate: string;
  mrrMinor: number;
}

export interface SaasInvoice {
  id: string;
  tenantId: string;
  status: "emitida" | "paga" | "vencida" | "reembolsada";
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  amountMinor: number;
  feeMinor: number;
  currency: "BRL";
  lineItems: { label: string; amountMinor: number }[];
}

export interface Reseller {
  id: string;
  name: string;
  type: "indicador" | "revendedor";
  status: "ativo" | "em_analise" | "inativo";
  contractVersion: string;
  region: string;
  goalTenants: number;
  attributedTenants: string[];
  leads: { id: string; company: string; stage: "novo" | "qualificado" | "proposta" | "ganho" | "perdido" }[];
}

export interface CommissionEntry {
  id: string;
  resellerId: string;
  invoiceRef: string;
  amountMinor: number;
  state: "prevista" | "aprovada" | "paga" | "ajuste";
  adjustmentRef?: string;
  createdAt: string;
}

export interface TicketEvent {
  id: string;
  when: string;
  actor: string;
  kind: "criado" | "nota" | "resposta" | "status" | "atribuicao" | "acesso";
  text: string;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  subject: string;
  category: "acesso" | "faturamento" | "desempenho" | "integracao" | "duvida";
  priority: "urgente" | "alta" | "media" | "baixa";
  status: "aberto" | "em_andamento" | "aguardando" | "resolvido" | "encerrado";
  assigneeId?: string;
  createdAt: string;
  slaDueAt?: string;
  requestId: string;
  history: TicketEvent[];
}

export type MetricStatus = "demo" | "estimate" | "partial" | "unavailable";

export interface AuditEvent {
  id: string;
  actorRole: RoleKey;
  action: string;
  objectType: string;
  objectId: string;
  when: string;
  outcome: "sucesso" | "negado" | "simulado";
  reason?: string;
}

export interface AppRelease {
  id: string;
  appId: "platform-admin" | "office-web" | "client-portal" | "partner-portal" | "api";
  semver: string;
  environment: "demo" | "staging" | "producao";
  status: "saudavel" | "degradado" | "planejado";
  releasedAt: string;
  notes: string;
  independentDeployment: true;
}

export interface ThirdPartyApp {
  id: string;
  name: string;
  owner: string;
  scopes: string[];
  quotaPerDay: number;
  requests7d: number[];
  status: "ativo" | "revogado" | "planejado";
  keyPreview: string;
  webhooks: string[];
}

export interface Incident {
  id: string;
  title: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  service: string;
  status: "investigando" | "mitigado" | "monitorando" | "resolvido";
  startedAt: string;
  timeline: { when: string; text: string }[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: RoleKey;
  mfa: boolean;
  lastSeen: string;
  sessions: number;
  active: boolean;
}

export interface Notification {
  id: string;
  title: string;
  to: string;
  when: string;
  read: boolean;
}
