import type { RoleKey } from "./types";

export const ROLES: Record<RoleKey, string> = {
  owner: "Proprietário da Plataforma",
  ops: "Operações",
  support: "Suporte",
  finance: "Financeiro",
  sales: "Comercial/Parcerias",
  security: "Segurança",
};

/** Route section -> roles allowed (DEMO only — not real security). */
export const SECTION_ACCESS: Record<string, RoleKey[]> = {
  dashboard: ["owner", "ops", "support", "finance", "sales", "security"],
  escritorios: ["owner", "ops", "support", "finance", "sales"],
  planos: ["owner", "finance", "sales"],
  licencas: ["owner", "ops", "finance", "sales"],
  assinaturas: ["owner", "finance", "sales"],
  financeiro: ["owner", "finance"],
  revendedores: ["owner", "sales", "finance"],
  suporte: ["owner", "ops", "support"],
  infra: ["owner", "ops", "security"],
  seguranca: ["owner", "security"],
  incidentes: ["owner", "ops", "support", "security"],
  developers: ["owner", "ops", "security"],
  releases: ["owner", "ops"],
  configuracoes: ["owner", "ops", "support", "finance", "sales", "security"],
};

export function canAccess(role: RoleKey, section: string) {
  return (SECTION_ACCESS[section] ?? ["owner"]).includes(role);
}

export function sectionFromPath(pathname: string) {
  return pathname.split("/")[2] ?? "dashboard";
}
