// Synthetic provider metrics. Never represent real Neon/Cloudflare data.
import type { MetricStatus } from "./types";
import type { SourceMode } from "./store";

export const APPS = ["todas", "platform-admin", "office-web", "client-portal", "api"] as const;
export type Period = "24h" | "7d" | "30d";
export const PERIOD_POINTS: Record<Period, number> = { "24h": 24, "7d": 7, "30d": 30 };

function wave(n: number, base: number, amp: number, seed: number) {
  return Array.from({ length: n }, (_, i) => Math.max(0, Math.round(base + amp * Math.sin((i + seed) / 2.3) + amp * 0.4 * Math.cos((i * seed) / 3.1))));
}

export function series(key: string, period: Period, app = "todas") {
  const n = PERIOD_POINTS[period];
  const seed = key.length + app.length;
  const factor = app === "todas" ? 1 : 0.25 + (app.length % 4) * 0.12;
  const label = (i: number) => (period === "24h" ? `${String(i).padStart(2, "0")}h` : `D${i + 1}`);
  const base: Record<string, [number, number]> = {
    requests: [42000, 9000], latency: [180, 40], errors4xx: [380, 90], errors5xx: [40, 18], cpu: [38, 14], storage: [312, 3],
    connections: [64, 20], locks: [3, 2], queries: [1800, 400], queue: [120, 60], retries: [14, 8], dlq: [3, 2], cost: [410, 60], traffic: [18, 5],
  };
  const [b, a] = base[key] ?? [100, 20];
  const values = wave(n, b * (key === "latency" || key === "cpu" ? 1 : factor), a * factor, seed);
  return values.map((v, i) => ({ label: label(i), value: v }));
}

export function metricStatus(mode: SourceMode, fallback: MetricStatus = "demo"): MetricStatus {
  return mode === "unavailable" ? "unavailable" : mode === "partial" ? "partial" : fallback;
}
