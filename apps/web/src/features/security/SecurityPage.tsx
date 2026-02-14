import { useState, useEffect } from "react";
import type { SecurityEvent } from "@lightwatch/shared";
import { getSecurityEvents } from "../../lib/api-client";
import "../../styles/components.css";

export function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setEvents(await getSecurityEvents(undefined, ctrl.signal));
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
        <h1>Security Events</h1>
        <p>Security incidents and audit trail</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="empty">No security events</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Source IP</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {events.map((evt) => (
              <tr key={evt.id}>
                <td className="mono">
                  {new Date(evt.timestamp).toLocaleString()}
                </td>
                <td>{evt.type}</td>
                <td>
                  <span className={`badge badge--${evt.severity}`}>
                    {evt.severity}
                  </span>
                </td>
                <td>{evt.source_ip ?? "—"}</td>
                <td>{evt.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
