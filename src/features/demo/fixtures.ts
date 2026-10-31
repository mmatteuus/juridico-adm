// Deterministic synthetic fixtures. Fictional companies only — no real CPF/CNPJ, tokens or accounts.
import type {
  AppRelease, AuditEvent, CommissionEntry, EntitlementGrant, Incident, Notification, PlanVersion,
  Reseller, SaasInvoice, StaffMember, SubscriptionSummary, SupportTicket, TenantSummary, ThirdPartyApp,
} from "./types";

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const r = rng(42);
const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
const day = (offset: number) => new Date(Date.UTC(2026, 9, 31) + offset * 86400000).toISOString();

const NAMES = [
  "Almeida & Prado Advocacia", "Bastos Ferraz Associados", "Cardoso Lemos Advogados", "Duarte Vilela Jurídico",
  "Esteves & Moura", "Fonseca Ribeiro Advocacia", "Guedes Teles Associados", "Herculano Paiva Advogados",
  "Ibrahim Nogueira Legal", "Jardim & Couto", "Kessler Andrade Advocacia", "Lacerda Fontes Associados",
  "Magalhães Rezende", "Nascimento Toledo Adv.", "Oliveira Brandão Jurídico", "Pimentel Sales Advocacia",
  "Queiroz Matos Associados", "Rocha Valente Advogados", "Siqueira Lobo Legal", "Tavares Amaral & Cia",
  "Uchoa Barreto Advocacia", "Vasconcelos Dias", "Werneck Pires Associados", "Xavier Coelho Advogados",
];
const CITIES = ["São Paulo/SP", "Belo Horizonte/MG", "Curitiba/PR", "Recife/PE", "Porto Alegre/RS", "Salvador/BA", "Goiânia/GO", "Florianópolis/SC"];
export const STAFF_NAMES = ["Marina Okada", "Rafael Quintana", "Beatriz Lontra", "Caio Mendonça", "Lívia Sarmento", "Tomás Vieira"];

export const PLANS: PlanVersion[] = [
  { id: "essencial-v2", name: "Essencial", version: 2, effectiveFrom: day(-120), features: ["agenda", "processos", "documentos"], seatLimit: 5, storageCapGb: 50, apiCallsMonth: 0, pricingState: "to_define", status: "ativo" },
  { id: "profissional-v3", name: "Profissional", version: 3, effectiveFrom: day(-60), features: ["agenda", "processos", "documentos", "financeiro", "portal_cliente"], seatLimit: 20, storageCapGb: 250, apiCallsMonth: 50000, pricingState: "to_define", status: "ativo" },
  { id: "corporativo-v1", name: "Corporativo", version: 1, effectiveFrom: day(-200), features: ["agenda", "processos", "documentos", "financeiro", "portal_cliente", "api", "sso", "auditoria"], seatLimit: 100, storageCapGb: 2000, apiCallsMonth: 1000000, pricingState: "to_define", status: "ativo" },
  { id: "profissional-v2", name: "Profissional", version: 2, effectiveFrom: day(-300), features: ["agenda", "processos", "documentos", "financeiro"], seatLimit: 15, storageCapGb: 200, apiCallsMonth: 20000, pricingState: "to_define", status: "arquivado" },
];
export const ADDONS = ["whatsapp_assistido", "assinatura_digital", "ia_resumos", "armazenamento_extra", "api_avancada"];
const PLAN_MRR: Record<string, number> = { "essencial-v2": 29900, "profissional-v3": 89900, "corporativo-v1": 349900, "profissional-v2": 69900 };

export const RESELLERS: Reseller[] = [
  { id: "rv-01", name: "Parceria Sul Tecnologia", type: "revendedor", status: "ativo", contractVersion: "RV-2026.1", region: "Sul", goalTenants: 8, attributedTenants: [], leads: [] },
  { id: "rv-02", name: "Consultoria Nordeste Legal Tech", type: "revendedor", status: "ativo", contractVersion: "RV-2026.1", region: "Nordeste", goalTenants: 6, attributedTenants: [], leads: [] },
  { id: "rv-03", name: "Indica Jur — Rede de Contadores", type: "indicador", status: "ativo", contractVersion: "IN-2026.2", region: "Sudeste", goalTenants: 4, attributedTenants: [], leads: [] },
  { id: "rv-04", name: "Centro-Oeste Digital", type: "revendedor", status: "em_analise", contractVersion: "RV-2026.1", region: "Centro-Oeste", goalTenants: 5, attributedTenants: [], leads: [] },
];

const STATUSES: TenantSummary["status"][] = ["ativo", "ativo", "ativo", "ativo", "trial", "inadimplente", "suspenso", "ativo", "cancelado"];
export const TENANTS: TenantSummary[] = NAMES.map((n, i) => {
  const plan = PLANS[i % 3];
  const seatLimit = plan.seatLimit;
  const partner = i % 3 === 0 ? RESELLERS[i % 4].id : undefined;
  if (partner) RESELLERS.find((p) => p.id === partner)!.attributedTenants.push(`tn-${100 + i}`);
  return {
    id: `tn-${100 + i}`,
    displayName: n,
    city: CITIES[i % CITIES.length],
    createdAt: day(-30 - Math.floor(r() * 400)),
    status: STATUSES[i % STATUSES.length],
    planId: plan.id,
    activeSeats: Math.max(1, Math.round(seatLimit * (0.4 + r() * 0.6))),
    seatLimit,
    storageGb: Math.round(plan.storageCapGb * (0.1 + r() * 0.7)),
    sourcePartnerId: partner,
    accountManager: pick(STAFF_NAMES),
    nextBillingDate: day(Math.floor(r() * 30)),
  };
});
RESELLERS.forEach((p, i) => {
  p.leads = ["Studio Jurídico Aurora", "Advocacia Monte Claro", "Teixeira & Ramos", "Lima Couto Adv."].slice(0, 2 + (i % 3)).map((c, j) => ({ id: `ld-${i}${j}`, company: c, stage: (["novo", "qualificado", "proposta", "ganho"] as const)[(i + j) % 4] }));
});

export const SUBSCRIPTIONS: SubscriptionSummary[] = TENANTS.map((t, i) => ({
  tenantId: t.id,
  planId: t.planId,
  status: ({ ativo: "ativa", trial: "trial", inadimplente: "regularizacao", suspenso: "suspensa", cancelado: "cancelada" } as const)[t.status],
  billingCycle: i % 4 === 0 ? "anual" : "mensal",
  startDate: t.createdAt,
  nextInvoiceDate: t.nextBillingDate,
  mrrMinor: t.status === "cancelado" || t.status === "trial" ? 0 : PLAN_MRR[t.planId],
}));

export const INVOICES: SaasInvoice[] = TENANTS.filter((t) => t.status !== "trial").flatMap((t, i) =>
  [0, 1, 2].map((m) => {
    const amount = PLAN_MRR[t.planId];
    const overdue = t.status === "inadimplente" && m === 0;
    const open = m === 0 && i % 5 === 1;
    const status: SaasInvoice["status"] = overdue ? "vencida" : open ? "emitida" : m === 2 && i % 11 === 3 ? "reembolsada" : "paga";
    return {
      id: `INV-${2026}${String(10 - m).padStart(2, "0")}-${String(i).padStart(3, "0")}`,
      tenantId: t.id,
      status,
      issuedAt: day(-m * 30 - 5),
      dueAt: day(-m * 30 + 5),
      paidAt: status === "paga" || status === "reembolsada" ? day(-m * 30 + 2) : undefined,
      amountMinor: amount,
      feeMinor: Math.round(amount * 0.029),
      currency: "BRL",
      lineItems: [{ label: `Plano ${t.planId}`, amountMinor: amount }],
    };
  }),
);

export const COMMISSIONS: CommissionEntry[] = INVOICES.filter((inv) => TENANTS.find((t) => t.id === inv.tenantId)?.sourcePartnerId && inv.status === "paga").map((inv, i) => ({
  id: `cm-${i + 1}`,
  resellerId: TENANTS.find((t) => t.id === inv.tenantId)!.sourcePartnerId!,
  invoiceRef: inv.id,
  amountMinor: Math.round(inv.amountMinor * 0.15),
  state: i % 3 === 0 ? "prevista" : i % 3 === 1 ? "aprovada" : "paga",
  createdAt: inv.paidAt!,
}));

export const ENTITLEMENTS: EntitlementGrant[] = [
  { id: "en-1", tenantId: "tn-101", featureKey: "ia_resumos", mode: "addon", validUntil: day(60), reason: "Piloto comercial aprovado", approvedBy: "Marina Okada", active: true, createdAt: day(-10) },
  { id: "en-2", tenantId: "tn-102", featureKey: "armazenamento_extra", mode: "override", validUntil: day(15), reason: "Migração de acervo", approvedBy: "Caio Mendonça", active: true, createdAt: day(-5) },
  { id: "en-3", tenantId: "tn-104", featureKey: "api_avancada", mode: "addon", reason: "Contrato corporativo", approvedBy: "Marina Okada", active: true, createdAt: day(-40) },
];

const SUBJECTS = ["Não consigo convidar novo membro", "Fatura com valor divergente", "Lentidão ao abrir agenda", "Erro na integração de assinatura", "Dúvida sobre limite de armazenamento", "Usuário bloqueado após troca de e-mail", "Webhook de teste não chegou", "Relatório mensal não carrega"];
const CATS: SupportTicket["category"][] = ["acesso", "faturamento", "desempenho", "integracao", "duvida", "acesso", "integracao", "desempenho"];
const PRIOS: SupportTicket["priority"][] = ["urgente", "alta", "media", "baixa", "alta", "urgente", "media", "baixa"];
const TSTAT: SupportTicket["status"][] = ["aberto", "em_andamento", "aguardando", "aberto", "resolvido", "aberto", "em_andamento", "encerrado"];
export const TICKETS: SupportTicket[] = Array.from({ length: 18 }, (_, i) => ({
  id: `TCK-${4200 + i}`,
  tenantId: TENANTS[(i * 5) % TENANTS.length].id,
  subject: SUBJECTS[i % 8],
  category: CATS[i % 8],
  priority: PRIOS[i % 8],
  status: TSTAT[i % 8],
  assigneeId: i % 3 === 0 ? undefined : STAFF_NAMES[i % 4],
  createdAt: day(-(i % 9) - 0.3),
  slaDueAt: day(-(i % 9) + (PRIOS[i % 8] === "urgente" ? 0.2 : 2)),
  requestId: `req_demo_${(9000 + i * 37).toString(16)}`,
  history: [{ id: `h${i}`, when: day(-(i % 9) - 0.3), actor: "Sistema (DEMO)", kind: "criado", text: "Chamado aberto pelo gestor do escritório." }],
}));

export const RELEASES: AppRelease[] = [
  { id: "rl-1", appId: "platform-admin", semver: "0.4.0", environment: "demo", status: "saudavel", releasedAt: day(-2), notes: "Shell e módulos comerciais", independentDeployment: true },
  { id: "rl-2", appId: "office-web", semver: "1.12.3", environment: "demo", status: "saudavel", releasedAt: day(-6), notes: "Agenda e processos", independentDeployment: true },
  { id: "rl-3", appId: "client-portal", semver: "0.9.1", environment: "demo", status: "degradado", releasedAt: day(-14), notes: "Portal do cliente", independentDeployment: true },
  { id: "rl-4", appId: "partner-portal", semver: "0.2.0", environment: "demo", status: "planejado", releasedAt: day(-20), notes: "Portal de revenda", independentDeployment: true },
  { id: "rl-5", appId: "api", semver: "1.3.0", environment: "demo", status: "saudavel", releasedAt: day(-4), notes: "API /v1 planejada", independentDeployment: true },
];

export const DEV_APPS: ThirdPartyApp[] = [
  { id: "app-1", name: "Conector ERP Contábil (fictício)", owner: "Integra Contas Ltda (fictícia)", scopes: ["tenants:read", "invoices:read"], quotaPerDay: 10000, requests7d: [3200, 3400, 3100, 3900, 4100, 2200, 1800], status: "ativo", keyPreview: "jd_demo_••••a91c", webhooks: ["invoice.paid"] },
  { id: "app-2", name: "Agenda Sync (fictício)", owner: "CalLegal Labs (fictícia)", scopes: ["calendar:read", "calendar:write"], quotaPerDay: 25000, requests7d: [9100, 8800, 9500, 10200, 9900, 4100, 3900], status: "ativo", keyPreview: "jd_demo_••••77de", webhooks: ["event.created", "event.updated"] },
  { id: "app-3", name: "Painel BI Parceiro (fictício)", owner: "Parceria Sul Tecnologia", scopes: ["metrics:read"], quotaPerDay: 2000, requests7d: [0, 0, 0, 0, 0, 0, 0], status: "planejado", keyPreview: "—", webhooks: [] },
];

export const INCIDENTS: Incident[] = [
  { id: "INC-31", title: "Latência elevada na API de documentos", severity: "SEV2", service: "api / workers", status: "monitorando", startedAt: day(-1), timeline: [{ when: day(-1), text: "Alerta de p95 > 800ms disparado (DEMO)." }, { when: day(-0.9), text: "Mitigação: cache de leitura ampliado." }] },
  { id: "INC-30", title: "Fila de e-mails transacionais com atraso", severity: "SEV3", service: "filas / notificações", status: "resolvido", startedAt: day(-6), timeline: [{ when: day(-6), text: "DLQ acima do limiar." }, { when: day(-5.8), text: "Reprocessamento concluído." }] },
  { id: "INC-29", title: "Indisponibilidade parcial do portal do cliente", severity: "SEV1", service: "client-portal", status: "resolvido", startedAt: day(-19), timeline: [{ when: day(-19), text: "Erro 5xx em 12% das requisições." }, { when: day(-18.9), text: "Rollback do client-portal 0.9.0." }] },
];

export const STAFF: StaffMember[] = STAFF_NAMES.map((n, i) => ({ id: `st-${i}`, name: n, role: (["owner", "ops", "support", "finance", "sales", "security"] as const)[i], mfa: i !== 4, lastSeen: day(-i * 0.4), sessions: 1 + (i % 3), active: true }));

export const AUDIT: AuditEvent[] = [
  { id: "au-1", actorRole: "owner", action: "entitlement.grant", objectType: "tenant", objectId: "tn-101", when: day(-10), outcome: "simulado", reason: "Piloto comercial aprovado" },
  { id: "au-2", actorRole: "finance", action: "invoice.refund", objectType: "invoice", objectId: "INV-202608-003", when: day(-25), outcome: "simulado", reason: "Cobrança duplicada" },
  { id: "au-3", actorRole: "security", action: "session.revoke", objectType: "staff", objectId: "st-4", when: day(-3), outcome: "simulado", reason: "Dispositivo perdido" },
];

export const NOTIFICATIONS: Notification[] = [
  { id: "nt-1", title: "Tenant tn-105 entrou em inadimplência", to: "/platform/escritorios/tn-105", when: day(-0.2), read: false },
  { id: "nt-2", title: "Ticket urgente TCK-4200 sem responsável", to: "/platform/suporte/TCK-4200", when: day(-0.4), read: false },
  { id: "nt-3", title: "INC-31 em monitoramento", to: "/platform/incidentes", when: day(-0.9), read: false },
  { id: "nt-4", title: "Override de armazenamento vence em 15 dias", to: "/platform/licencas", when: day(-2), read: true },
];

export const FEATURE_FLAGS = [
  { key: "nova_agenda", description: "Nova agenda do office-web", available: true },
  { key: "ia_resumos", description: "Resumos com IA", available: true },
  { key: "whatsapp_assistido", description: "Envio assistido de WhatsApp", available: false },
  { key: "api_avancada", description: "API v1 para terceiros", available: false },
];

export { day as demoDay };
