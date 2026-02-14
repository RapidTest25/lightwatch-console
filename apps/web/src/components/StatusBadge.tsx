import "./dashboard.css";

export type ServiceStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

const STATUS_CONFIG: Record<ServiceStatus, { dot: string; label: string }> = {
  healthy: { dot: "status-badge__dot--healthy", label: "Healthy" },
  degraded: { dot: "status-badge__dot--degraded", label: "Degraded" },
  unhealthy: { dot: "status-badge__dot--unhealthy", label: "Unhealthy" },
  unknown: { dot: "status-badge__dot--unknown", label: "Unknown" },
};

interface StatusBadgeProps {
  status: string;
  /** Compact mode shows only the dot, no text */
  compact?: boolean;
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const key = (STATUS_CONFIG[status as ServiceStatus] ? status : "unknown") as ServiceStatus;
  const cfg = STATUS_CONFIG[key];

  return (
    <span className={`status-badge status-badge--${key}`}>
      <span className={`status-badge__dot ${cfg.dot}`} />
      {!compact && <span className="status-badge__text">{cfg.label}</span>}
    </span>
  );
}
