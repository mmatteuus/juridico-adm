import { render, screen, fireEvent } from "@testing-library/react";
import { Route as LicencasPage } from "@/routes/platform/licencas";
import { useDemo } from "@/features/demo/store";

jest.mock("@/features/demo/store", () => {
  const original = jest.requireActual("@/features/demo/store");
  return {
    ...original,
    useDemo: (selector) => {
      if (selector === (s) => s.entitlements) {
        return [
          { id: "e1", tenantId: "tn-1", featureKey: "extra-storage", mode: "addon", reason: "demo", approvedBy: "owner", active: true, createdAt: "2026-01-01" },
        ];
      }
      if (selector === (s) => s.tenants) {
        return [{ id: "tn-1", displayName: "Escritório Teste", city: "Recife/PE", createdAt: "2026-01-01", status: "ativo", planId: "plan-1", activeSeats: 1, seatLimit: 5, storageGb: 0, accountManager: "Ana", nextBillingDate: "2026-02-01" }];
      }
      return selector({} as any);
    },
  };
});

test("renderiza Licenças header", () => {
  render(<LicencasPage />);
  expect(screen.getByRole("heading", { name: /licenças/i })).toBeInTheDocument();
});

test("exibe KPI de entitlements ativos", () => {
  render(<LicencasPage />);
  expect(screen.getByText(/entitlements ativos/i)).toBeInTheDocument();
  expect(screen.getByText("1")).toBeInTheDocument(); // one active entitlement
});

test("tabela contém o add‑on criado", async () => {
  render(<LicencasPage />);
  const rows = await screen.findAllByRole("row");
  // header + 1 data row
  expect(rows).toHaveLength(2);
  expect(screen.getByText(/extra-storage/i)).toBeInTheDocument();
});