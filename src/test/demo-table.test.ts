import { describe, expect, it } from "vitest";
import { createDemoCsv, csvCell, matchesSearch } from "@/features/demo/table";

describe("Demo table search", () => {
  it("finds accented office names without requiring accents", () => {
    expect(matchesSearch("São Paulo · Escritório Ávila", "sao avila")).toBe(true);
    expect(matchesSearch("São Paulo · Escritório Ávila", "sao silva")).toBe(false);
  });
  it("ignores whitespace and letter case", () => {
    expect(matchesSearch("Fatura INV-2026", "  FATURA   2026  ")).toBe(true);
  });
});

describe("Demo CSV export", () => {
  it("starts with a real header and retains accents, quotes and separators", () => {
    expect(createDemoCsv(["Escritório", "Valor"], [['Ávila; "SP"', 1200]]))
      .toBe('\uFEFF"Escritório";"Valor"\r\n"Ávila; ""SP""";"1200"');
  });
  it("exports formulas as text while preserving negative numeric adjustments", () => {
    expect(csvCell("=SUM(A1:A3)")).toBe('"\'=SUM(A1:A3)"');
    expect(csvCell(" +123")).toBe('"\' +123"');
    expect(csvCell(-1200)).toBe('"-1200"');
  });
});