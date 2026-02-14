import { useState, useEffect } from "react";
import type {
  Alert,
  CreateAlertPayload,
  AlertOperator,
} from "@lightwatch/shared";
import { getAlerts, createAlert } from "../../lib/api-client";
import { useLiveStream } from "../../hooks/use-live-stream";
import "../../styles/components.css";

const OPERATORS: { value: AlertOperator; label: string }[] = [
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "eq", label: "==" },
  { value: "neq", label: "!=" },
];

const INITIAL_FORM: CreateAlertPayload = {
  name: "",
  service: "",
  metric: "",
  operator: "gt",
  threshold: 0,
  duration: "5m",
};

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Live alerts stream
  const { messages: liveAlerts, connected } = useLiveStream<Alert>("alerts", {
    enabled: true,
  });

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAlertPayload>({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    setLoading(true);
    setError(null);
    try {
      setAlerts(await getAlerts());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof CreateAlertPayload>(
    key: K,
    value: CreateAlertPayload[K],
  ) {
    setForm((prev: CreateAlertPayload) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Name is required";
    if (!form.metric.trim()) return "Metric is required";
    if (form.threshold < 0) return "Threshold must be ≥ 0";
    if (!form.duration.trim()) return "Duration is required";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setSuccess(null);

    try {
      const created = await createAlert(form);
      setAlerts((prev) => [created, ...prev]);
      setForm({ ...INITIAL_FORM });
      setShowForm(false);
      setSuccess(`Alert "${created.name}" created successfully`);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Alerts</h1>
        <p>
          Manage alert rules
          <span
            className={`status-dot ${connected ? "status-dot--connected" : "status-dot--disconnected"}`}
            style={{ marginLeft: 10 }}
          />
          <span
            style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}
          >
            {connected ? "Live" : "Disconnected"}
            {liveAlerts.length > 0 && ` · ${liveAlerts.length} new`}
          </span>
        </p>
      </div>

      <div className="toolbar">
        <button
          className="btn btn--primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ New Alert"}
        </button>
        <button className="btn" onClick={fetchAlerts}>
          Refresh
        </button>
      </div>

      {success && <div className="success-box">{success}</div>}
      {error && <div className="error-box">{error}</div>}

      {/* ── Create form ────────────────────────────────── */}
      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          {formError && <div className="error-box">{formError}</div>}

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div className="form-group">
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. High CPU"
              />
            </div>
            <div className="form-group">
              <label>Service (optional)</label>
              <input
                value={form.service ?? ""}
                onChange={(e) => updateField("service", e.target.value)}
                placeholder="e.g. api-gateway"
              />
            </div>
            <div className="form-group">
              <label>Metric</label>
              <input
                value={form.metric}
                onChange={(e) => updateField("metric", e.target.value)}
                placeholder="e.g. cpu_usage"
              />
            </div>
            <div className="form-group">
              <label>Operator</label>
              <select
                value={form.operator}
                onChange={(e) =>
                  updateField("operator", e.target.value as AlertOperator)
                }
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label} ({op.value})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Threshold</label>
              <input
                type="number"
                value={form.threshold}
                onChange={(e) =>
                  updateField("threshold", Number(e.target.value))
                }
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                value={form.duration}
                onChange={(e) => updateField("duration", e.target.value)}
                placeholder="e.g. 5m, 1h"
              />
            </div>
          </div>

          <button
            className="btn btn--primary"
            type="submit"
            disabled={submitting}
            style={{ marginTop: 8 }}
          >
            {submitting ? "Creating…" : "Create Alert"}
          </button>
        </form>
      )}

      {/* ── Alert list ─────────────────────────────────── */}
      {loading ? (
        <div className="loading">Loading alerts…</div>
      ) : alerts.length === 0 ? (
        <div className="empty">No alerts configured</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Service</th>
              <th>Condition</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td>{alert.name}</td>
                <td>{alert.service ?? "—"}</td>
                <td className="mono">
                  {alert.metric}{" "}
                  {OPERATORS.find((o) => o.value === alert.operator)?.label ??
                    alert.operator}{" "}
                  {alert.threshold}
                </td>
                <td>{alert.duration}</td>
                <td>
                  <span className={`badge badge--${alert.status}`}>
                    {alert.status}
                  </span>
                </td>
                <td className="mono">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
