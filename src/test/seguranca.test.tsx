import { render, screen } from "@testing-library/react";
import { Route as SegurancaPage } from "@/routes/platform/seguranca";
import { useDemo } from "@/features/demo/store";

jest.mock("@/features/demo/store", () => {
  const original = jest.requireActual("@/features/demo/store");
  return {
    ...original,
    useDemo: (selector) => {
      if (selector === (s) => s.audit) {
        return [{ id: "au-1", actorRole: "owner", action: "login", objectType: "user", objectId: "owner", when: "2026-01-01T00:00:00Z", outcome: "sucesso" }];
      }
      return selector({} as any);
    },
  };
});

test("renderiza header de Segurança", () => {
  render(<SegurancaPage />);
  expect(screen.getByRole('heading', { name: /segurança/i })).toBeInTheDocument();
});

test("exibe KPI de eventos auditados", () => {
  render(<SegurancaPage />);
  expect(screen.getByText(/eventos auditados/i)).toBeInTheDocument();
});

test("mostra aba de auditoria por padrão", () => {
  render(<SegurancaPage />);
  expect(screen.getByRole('button', { name: /auditoria/i })).toHaveAttribute('aria-selected', 'true');
});