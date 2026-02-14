import { useState, useEffect } from "react";
import type { MetricEntry } from "@lightwatch/shared";
import { getMetrics } from "../../lib/api-client";
import "../../styles/components.css";

export function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setMetrics(await getMetrics(undefined, ctrl.signal));
      } catch (err) {
        if (!ctrl.signal.aborted) setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Metrics</h1>
        <p>System and application metrics</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading">Loading metrics…</div>
      ) : metrics.length === 0 ? (
        <div className="empty">No metrics available</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Service</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td className="mono">{m.value}</td>
                <td>{m.unit ?? "—"}</td>
                <td>{m.service ?? "—"}</td>
                <td className="mono">
                  {new Date(m.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
