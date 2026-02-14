import "./dashboard.css";

interface SkeletonProps {
  /** Number of rows to show */
  rows?: number;
}

export function TableSkeleton({ rows = 5 }: SkeletonProps) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-cell skeleton-cell--name" />
          <div className="skeleton-cell skeleton-cell--badge" />
          <div className="skeleton-cell skeleton-cell--text" />
          <div className="skeleton-cell skeleton-cell--time" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="summary-row">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="summary-card summary-card--skeleton">
          <div className="skeleton-cell skeleton-cell--label" />
          <div className="skeleton-cell skeleton-cell--number" />
        </div>
      ))}
    </div>
  );
}
