import { useState, useEffect } from "react";
import { formatRelativeTime } from "../lib/relative-time";

interface RelativeTimeProps {
  date: string | Date | undefined | null;
  /** How often to re-render (ms). Default: 15000 */
  refreshMs?: number;
  className?: string;
}

/**
 * Renders a relative timestamp that auto-updates.
 * Shows full date on hover via title attribute.
 */
export function RelativeTime({ date, refreshMs = 15_000, className }: RelativeTimeProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!date) return;
    const id = setInterval(() => setTick((t) => t + 1), refreshMs);
    return () => clearInterval(id);
  }, [date, refreshMs]);

  const fullDate = date
    ? new Date(typeof date === "string" ? date : date).toLocaleString()
    : undefined;

  return (
    <time className={className} dateTime={date?.toString()} title={fullDate}>
      {formatRelativeTime(date)}
    </time>
  );
}
