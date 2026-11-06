import { render, screen } from "@testing-library/react";
import { Route } from "@/routes/platform/planos";
import { useDemo } from "@/features/demo/store";

// Mock the useDemo hook
jest.mock("@/features/demo/store", () => ({
  ...jest.requireActual("@/features/demo/store"),
  useDemo: (selector) => {
    // Return mock data for testing
    if (selector === (s) => s.plans) {
      return [
        {
          id: "plan-1",
          name: "Starter",
          version: 1,
          features: ["Basic"],
          seatLimit: 5,
          storageCapGb: 10,
          apiCallsMonth: 1000,
          mrrMonthlyMinor: 5000,
          effectiveFrom: "2026-01-01",
          status: "ativo",
          pricingState: "defined",
        },
        {
          id: "plan-2",
          name: "Professional",
          version: 2,
          features: ["Advanced", "Priority Support"],
          seatLimit: 20,
          storageCapGb: 50,
          apiCallsMonth: 10000,
          mrrMonthlyMinor: 20000,
          effectiveFrom: "2026-01-01",
          status: "ativo",
          pricingState: "defined",
        },
      ];
    }
    return selector({} as any);
  },
}));

test("renders Planos page header", () => {
  render(<Route />);
  const heading = screen.getByRole("heading", { name: /planos/i });
  expect(heading).toBeInTheDocument();
});

test("displays KPI cards", () => {
  render(<Route />);
  expect(screen.getByText(/planos ativos/i)).toBeInTheDocument();
  expect(screen.getByText(/planos total/i)).toBeInTheDocument();
  expect(screen.getByText(/assentos totais/i)).toBeInTheDocument();
  expect(screen.getByText(/armazenamento total/i)).toBeInTheDocument();
});

test("renders resource table with plans", async () => {
  render(<Route />);
  // Wait for table rows to appear
  const rows = await screen.findAllByRole("row");
  // Should have header row + 2 data rows
  expect(rows.length).toBe(3);
  expect(await screen.findByText(/starter/i)).toBeInTheDocument();
  expect(await screen.findByText(/professional/i)).toBeInTheDocument();
});