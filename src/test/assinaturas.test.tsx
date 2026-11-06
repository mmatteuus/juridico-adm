import { render, screen, fireEvent } from "@testing-library/react";
import { Route as AssinaturasPage } from "@/routes/platform/assinaturas";
import { useDemo } from "@/features/demo/store";

jest.mock("@/features/demo/store", () => {
  const original = jest.requireActual("@/features/demo/store");
  return {
    ...original,
    useDemo: (selector) => {
      if (selector === (s) => s.subscriptions) {
        return [
          {
            tenantId: "tn-1",
            planId: "plan-1",
            status: "ativa",
            billingCycle: "mensal",
            startDate: "2026-01-01",
            nextInvoiceDate: "2026-02-01",
            mrrMinor: 5000,
          },
        ];
      }
      if (selector === (s) => s.tenants) {
        return [{
          id: "tn-1",
          displayName: "Escritório Teste",
          city: "Recife/PE",
          createdAt: "2026-01-01",
          status: "ativo",
          planId: "plan-1",
          activeSeats: 1,
          seatLimit: 5,
          storageGb: 0,
          accountManager: "Ana",
          nextBillingDate: "2026-02-01",
        }];
      }
      if (selector === (s) => s.plans) {
        return [{ id: "plan-1", name: "Starter", version: 1, effectiveFrom: "2026-01-01", features: [], seatLimit: 5, storageCapGb: 10, apiCallsMonth: 1000, mrrMonthlyMinor: 5000, pricingState: "defined", status: "ativo" }];
      }
      return selector({} as any);
    },
  };
});

test("renderiza header de Assinaturas", () => {
  render(<AssinaturasPage />);
  expect(screen.getByRole('heading', { name: /assinaturas/i })).toBeInTheDocument();
});

test("exibe KPIs de MRR e ARR", () => {
  render(<AssinaturasPage />);
  expect(screen.getByText(/mrr contratual/i)).toBeInTheDocument();
  expect(screen.getByText(/arr contratual/i)).toBeInTheDocument();
});

test("tabela de assinaturas apresenta dados", async () => {
  render(<AssinaturasPage />);
  const rows = await screen.findAllByRole('row');
  // header + 1 data row
  expect(rows).toHaveLength(2);
  expect(screen.getByText(/escritório teste/i)).toBeInTheDocument();
});

test("abre dialog de mudança de plano", async () => {
  render(<AssinaturasPage />);
  const button = screen.getByRole('button', { name: /alterar plano/i });
  fireEvent.click(button);
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});