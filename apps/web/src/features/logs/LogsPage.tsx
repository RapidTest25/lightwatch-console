import { useState, useEffect, useCallback } from "react";
import type { LogEntry, LogLevel, LogFilters } from "@lightwatch/shared";
import { getLogs } from "../../lib/api-client";
import { useLiveStream } from "../../hooks/use-live-stream";
import "../../styles/components.css";

const LEVELS: LogLevel[] = ["debug", "info", "warn", "error", "fatal"];
const PAGE_SIZE = 50;

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Filters
  const [service, setService] = useState("");
  const [level, setLevel] = useState<LogLevel | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Live toggle
  const [liveEnabled, setLiveEnabled] = useState(false);
  const {
    messages: liveLogs,
    connected,
    clear,
  } = useLiveStream<LogEntry>("logs", {
    enabled: liveEnabled,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: LogFilters = {
        page,
        limit: PAGE_SIZE,
        ...(service && { service }),
        ...(level && { level }),
        ...(from && { from }),
        ...(to && { to }),
      };
      const data = await getLogs(filters);
      setLogs(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, service, level, from, to]);

  useEffect(() => {
    if (!liveEnabled) fetchLogs();
  }, [fetchLogs, liveEnabled]);

  const displayLogs = liveEnabled ? liveLogs : logs;

  return (
    <div>
      <div className="page-header">
        <h1>Logs Explorer</h1>
        <p>Search and filter application logs</p>
      </div>

      {/* ── Toolbar ────────────────────────────────────── */}
      <div className="toolbar">
        <input
          placeholder="Service name"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as LogLevel | "")}
        >
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          title="From"
        />
        <input
          type="datetime-local"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          title="To"
        />
        <button className="btn" onClick={fetchLogs} disabled={liveEnabled}>
          Search
        </button>

        <span style={{ marginLeft: "auto" }} />

        <button
          className={`btn ${liveEnabled ? "btn--primary" : ""}`}
          onClick={() => {
            if (liveEnabled) clear();
            setLiveEnabled(!liveEnabled);
          }}
        >
          <span
            className={`status-dot ${connected ? "status-dot--connected" : "status-dot--disconnected"}`}
          />
          {liveEnabled ? "Live" : "Live Off"}
        </button>
      </div>

      {/* ── Error ──────────────────────────────────────── */}
      {error && <div className="error-box">{error}</div>}

      {/* ── Table ──────────────────────────────────────── */}
      {loading && !liveEnabled ? (
        <div className="loading">Loading logs…</div>
      ) : displayLogs.length === 0 ? (
        <div className="empty">No logs found</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Service</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {displayLogs.map((log, i) => (
              <tr key={log.id ?? i}>
                <td className="mono">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td>
                  <span className={`badge badge--${log.level}`}>
                    {log.level}
                  </span>
                </td>
                <td>{log.service ?? "—"}</td>
                <td className="mono">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Pagination ─────────────────────────────────── */}
      {!liveEnabled && (
        <div
          className="toolbar"
          style={{ marginTop: 16, justifyContent: "center" }}
        >
          <button
            className="btn btn--sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span
            style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}
          >
            Page {page}
          </span>
          <button
            className="btn btn--sm"
            disabled={displayLogs.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
