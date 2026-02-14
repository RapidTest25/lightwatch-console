import type { ReactNode } from "react";
import "./dashboard.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-aligned actions (buttons, indicators, etc.) */
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-hdr">
      <div className="page-hdr__text">
        <h1 className="page-hdr__title">{title}</h1>
        {subtitle && <p className="page-hdr__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-hdr__actions">{actions}</div>}
    </div>
  );
}
