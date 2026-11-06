import { render, screen, fireEvent } from "@testing-library/react";
import { Route as ConfiguracoesPage } from "@/routes/platform/configuracoes";
import { useDemo } from "@/features/demo/store";

jest.mock("@/features/demo/store", () => {
  const original = jest.requireActual("@/features/demo/store");
  return {
    ...original,
    useDemo: (selector) => {
      if (selector === (s) => s.sourceMode) return "ok";
      return selector({} as any);
    },
  };
});

test("renderiza header de Configurações", () => {
  render(<ConfiguracoesPage />);
  expect(screen.getByRole('heading', { name: /configurações/i })).toBeInTheDocument();
});

test("exibe KPI de modo de fonte", () => {
  render(<ConfiguracoesPage />);
  expect(screen.getByText(/modo de fonte/i)).toBeInTheDocument();
});

test("abre dialog de alterar modo de fonte", async () => {
  render(<ConfiguracoesPage />);
  const button = screen.getByRole('button', { name: /alterar modo de fonte/i });
  fireEvent.click(button);
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});