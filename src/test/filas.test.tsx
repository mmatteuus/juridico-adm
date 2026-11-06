import { render, screen, fireEvent } from "@testing-library/react";
import { Route as FilasPage } from "@/routes/platform/infra/filas";
import { useDemo } from "@/features/demo/store";
import { series } from "@/features/demo/metrics";

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

jest.mock("@/features/demo/metrics", () => {
  return {
    series: jest.fn().mockImplementation((key, period) => {
      if (key === "queue") return [{ label: "D1", value: 10 }, { label: "D30", value: 5 }];
      if (key === "dlq") return [{ label: "D1", value: 0 }, { label: "D30", value: 0 }];
      if (key === "retries") return [{ label: "D1", value: 2 }, { label: "D30", value: 1 }];
      return [];
    }),
  };
});

test("renderiza header de Filas", () => {
  render(<FilasPage />);
  expect(screen.getByRole('heading', { name: /filas e jobs/i })).toBeInTheDocument();
});

test("exibe KPIs de jobs pendentes, dlq e re‑tentativas", () => {
  render(<FilasPage />);
  expect(screen.getByText(/jobs pendentes/i)).toBeInTheDocument();
  expect(screen.getByText(/dlq/i)).toBeInTheDocument();
  expect(screen.getByText(/re‑tentativas/i)).toBeInTheDocument();
});

test("renderiza gráficos de fila, dlq e re‑tentativas", async () => {
  render(<FilasPage />);
  // Espera o ChartPanel ser renderizado (mocka a série)
  expect(await screen.findAllByText(/D30/i)).toHaveLength(3);
});