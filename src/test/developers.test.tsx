import { render, screen, fireEvent } from "@testing-library/react";
import { Route as DevelopersPage } from "@/routes/platform/developers";
import { useDemo } from "@/features/demo/store";

jest.mock("@/features/demo/store", () => {
  const original = jest.requireActual("@/features/demo/store");
  return {
    ...original,
    useDemo: (selector) => {
      if (selector === (s) => s.devApps) {
        return [{ id: "app-1", name: "MyApp", owner: "Demo", scopes: ["read", "write"], quotaPerDay: 1000, requests7d: [0,0,0,0,0,0,0], status: "ativo", keyPreview: "jd_demo_••••app-1", webhooks: [] }];
      }
      return selector({} as any);
    },
  };
});

test("renderiza header de Developers", () => {
  render(<DevelopersPage />);
  expect(screen.getByRole('heading', { name: /developers/i })).toBeInTheDocument();
});

test("exibe lista de aplicativos", async () => {
  render(<DevelopersPage />);
  const rows = await screen.findAllByRole('row');
  expect(rows.length).toBe(2); // header + 1 app
  expect(screen.getByText(/myapp/i)).toBeInTheDocument();
});

test("abre dialog de criar app", async () => {
  render(<DevelopersPage />);
  const button = screen.getByRole('button', { name: /criar app/i });
  fireEvent.click(button);
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});