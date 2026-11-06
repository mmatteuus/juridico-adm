import { render, screen } from "@testing-library/react";
import { Route as PlanosPage } from "@/routes/platform/planos";
import { useDemo } from "@/features/demo/store";

jest.mock("@/features/demo/store", () => ({
  ...jest.requireActual("@/features/demo/store"),
  useDemo: (selector) => {
    const state = {
      role: "support", // Role without administrative permissions
      plans: [],
      tenants: [],
    };
    return selector(state);
  },
}));

test("usuário support não deve ver botões administrativos em Planos", () => {
  render(<PlanosPage />);
  // Verificando que botões de 'criar' ou 'editar' não estão presentes para support
  const createBtn = screen.queryByRole('button', { name: /criar plano/i });
  expect(createBtn).not.toBeInTheDocument();
});

test("usuário owner deve ver botões administrativos em Planos", () => {
  // Mocking role as owner for this specific test
  (useDemo as any).mockImplementation((selector: any) => {
    return selector({ role: "owner", plans: [], tenants: [] });
  });
  render(<PlanosPage />);
  const createBtn = screen.getByRole('button', { name: /criar plano/i });
  expect(createBtn).toBeInTheDocument();
});
