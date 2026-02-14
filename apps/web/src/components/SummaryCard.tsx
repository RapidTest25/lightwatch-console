import type { ReactNode } from "react";
import "./dashboard.css";

export interface SummaryCardProps {
  label: string;
  value: ReactNode;
  /** Optional accent color for the left border */
  accent?: "default" | "success" | "warning" | "error" | "info";
  /** Optional secondary text below the value */
  sub?: string;
}

export function SummaryCard({ label, value, accent = "default", sub }: SummaryCardProps) {
  return (
    <div className={`summary-card summary-card--${accent}`}>
      <span className="summary-card__label">{label}</span>
      <span className="summary-card__value">{value}</span>
      {sub && <span className="summary-card__sub">{sub}</span>}
    </div>
  );
}
