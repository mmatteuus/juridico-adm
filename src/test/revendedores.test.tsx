import { render, screen, fireEvent } from "@testing-library/react";
import { Route as RevendedoresPage } from "@/routes/platform/revendedores";
import { useDemo } from "@/features/demo/store";

jest.mock("@/features/demo/store", () => {
  const original = jest.requireActual("@/features/demo/store");
  return {
    ...original,
    useDemo: (selector) => {
      if (selector === (s) => s.resellers) {
        return [
          { id: "rv-1", name: "Partner A", type: "revendedor", status: "ativo", region: "SP", contractVersion: "RV-2026.1", goalTenants: 5, attributedTenants: [], leads: [] },
        ];
      }
      if (selector === (s) => s.commissions) {
        return [{ id: "c1", resellerId: "rv-1", invoiceRef: "inv-1", amountMinor: 1500, state: "prevista", createdAt: "2026-01-01" }];
      }
      return selector({} as any);
    },
  };
});

test("renderiza Revendedores header", () => {
  render(<RevendedoresPage />);
  expect(screen.getByRole('heading', { name: /revendedores/i })).toBeInTheDocument();
});

test("exibe KPI de revendedores e comissão total", () => {
  render(<RevendedoresPage />);
  expect(screen.getByText(/revendedores/i)).toBeInTheDocument();
  expect(screen.getByText(/comissão total/i)).toBeInTheDocument();
});

test("tabela lista o parceiro", async () => {
  render(<RevendedoresPage />);
  const rows = await screen.findAllByRole('row');
  expect(rows.length).toBe(2); // header + 1 data row
  expect(screen.getByText(/partner a/i)).toBeInTheDocument();
});