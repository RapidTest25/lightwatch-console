import "./dashboard.css";

interface LiveIndicatorProps {
  /** Whether the system is actively polling / connected */
  active: boolean;
  label?: string;
}

export function LiveIndicator({ active, label }: LiveIndicatorProps) {
  return (
    <span className={`live-indicator ${active ? "live-indicator--active" : ""}`}>
      <span className="live-indicator__dot" />
      <span className="live-indicator__label">{label ?? (active ? "LIVE" : "PAUSED")}</span>
    </span>
  );
}
