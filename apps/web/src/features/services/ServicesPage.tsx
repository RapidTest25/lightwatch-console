import { useState, useMemo } from "react";
import type { ServiceRecord } from "@lightwatch/shared";
import { getServices } from "../../lib/api-client";
import { usePolling } from "../../hooks/use-polling";
import {
  PageHeader,
  SummaryCard,
  StatusBadge,
  LiveIndicator,
  RelativeTime,
  TableSkeleton,
  CardSkeleton,
} from "../../components";

const INTERVALS = [
  { label: "5s", ms: 5_000 },
  { label: "10s", ms: 10_000 },
  { label: "30s", ms: 30_000 },
] as const;

export function ServicesPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalMs, setIntervalMs] = useState(10_000);

  const { data: services, loading, error, lastUpdated, refresh } = usePolling<ServiceRecord[]>({
    fetcher: (signal) => getServices(signal),
    intervalMs,
    enabled: autoRefresh,
  });

  // ── Derived stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const list = services ?? [];
    const total = list.length;
    const healthy = list.filter((s) => s.status === "healthy").length;
    const degraded = list.filter((s) => s.status === "degraded").length;
    const unhealthy = total - healthy - degraded;
    return { total, healthy, degraded, unhealthy };
  }, [services]);

  const isFirstLoad = loading && !services;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header + Controls ───────────────────────────────────────── */}
      <PageHeader
        title="Services"
        subtitle="Real-time overview of registered services"
        actions={
          <>
            <LiveIndicator active={autoRefresh} />

            <select
              className="interval-select"
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              title="Refresh interval"
            >
              {INTERVALS.map((iv) => (
                <option key={iv.ms} value={iv.ms}>
                  {iv.label}
                </option>
              ))}
            </select>

            <button
              className="btn btn--sm"
              onClick={() => setAutoRefresh((v) => !v)}
            >
              {autoRefresh ? "Pause" : "Resume"}
            </button>

            <button
              className={`btn-icon${loading ? " btn-icon--spinning" : ""}`}
              onClick={refresh}
              title="Refresh now"
            >
              ↻
            </button>
          </>
        }
      />

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && <div className="error-box">{error}</div>}

      {/* ── Summary Cards ───────────────────────────────────────────── */}
      {isFirstLoad ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="summary-row">
          <SummaryCard
            label="Total Services"
            value={stats.total}
            accent="info"
          />
          <SummaryCard
            label="Healthy"
            value={stats.healthy}
            accent="success"
            sub={stats.total > 0 ? `${Math.round((stats.healthy / stats.total) * 100)}%` : undefined}
          />
          <SummaryCard
            label="Degraded"
            value={stats.degraded}
            accent="warning"
          />
          <SummaryCard
            label="Unhealthy"
            value={stats.unhealthy}
            accent="error"
          />
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────── */}
      {isFirstLoad ? (
        <TableSkeleton rows={4} />
      ) : !services || services.length === 0 ? (
        <EmptyServices />
      ) : (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
              <th>Host</th>
              <th>Version</th>
              <th>Last Heartbeat</th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc) => (
              <tr key={svc.id}>
                <td className="col-name">{svc.name}</td>
                <td>
                  <StatusBadge status={svc.status} />
                </td>
                <td className="col-mono">{svc.host ?? "—"}</td>
                <td>
                  {svc.meta?.version ? (
                    <span className="col-version">v{String(svc.meta.version)}</span>
                  ) : (
                    <span className="col-mono">—</span>
                  )}
                </td>
                <td>
                  <RelativeTime date={svc.last_heartbeat} className="col-mono" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Footer ──────────────────────────────────────────────────── */}
      {lastUpdated && (
        <div className="updated-at">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────

function EmptyServices() {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">📡</div>
      <div className="empty-state__title">No services registered</div>
      <p className="empty-state__text">
        Services appear here automatically when they send heartbeats to the
        Lightwatch ingest API. Try sending one:
      </p>
      <code className="empty-state__code">
{`curl -X POST http://localhost:3001/ingest/heartbeat \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "my-api",
    "host": "prod-1",
    "meta": { "version": "1.0.0" }
  }'`}
      </code>
    </div>
  );
}
