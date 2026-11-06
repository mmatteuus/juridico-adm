/** Browser-safe table helpers shared by the demo screens. */
export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function matchesSearch(value: string, query: string): boolean {
  const normalized = normalizeSearch(value);
  return normalizeSearch(query).split(/\s+/).every((term) => normalized.includes(term));
}

export function csvCell(value: string | number): string {
  const text = String(value);
  // Spreadsheet formula prefixes must remain literal text in exported data.
  const safe = /^\s*[=+@-]/.test(text) && typeof value !== "number" ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function createDemoCsv(headers: string[], rows: (string | number)[][]): string {
  return "\uFEFF" + [headers.map(csvCell).join(";"), ...rows.map((row) => row.map(csvCell).join(";"))].join("\r\n");
}