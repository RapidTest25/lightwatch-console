// ─── Lightweight relative-time formatter ─────────────────────────────
// No external dependencies. Returns human-readable strings like "2m ago".

interface TimeUnit {
  max: number; // upper bound in seconds (exclusive)
  divisor: number;
  label: string;
  plural: string;
}

const UNITS: TimeUnit[] = [
  { max: 5, divisor: 1, label: "just now", plural: "just now" },
  { max: 60, divisor: 1, label: "s ago", plural: "s ago" },
  { max: 3600, divisor: 60, label: "m ago", plural: "m ago" },
  { max: 86400, divisor: 3600, label: "h ago", plural: "h ago" },
  { max: 604800, divisor: 86400, label: "d ago", plural: "d ago" },
  { max: 2592000, divisor: 604800, label: "w ago", plural: "w ago" },
  { max: Infinity, divisor: 2592000, label: "mo ago", plural: "mo ago" },
];

/**
 * Format a date string or Date into a compact relative time string.
 * e.g. "2m ago", "3h ago", "just now"
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return "—";

  const then = typeof date === "string" ? new Date(date) : date;
  const diffSec = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000));

  for (const unit of UNITS) {
    if (diffSec < unit.max) {
      if (unit.max === 5) return unit.label; // "just now"
      const value = Math.floor(diffSec / unit.divisor);
      return `${value}${value === 1 ? unit.label : unit.plural}`;
    }
  }

  return "long ago";
}

/**
 * Returns a brief freshness label for use in status context.
 * "fresh" = < 2 min, "stale" = 2-10 min, "dead" = > 10 min
 */
export function heartbeatFreshness(
  date: string | Date | undefined | null,
): "fresh" | "stale" | "dead" | "unknown" {
  if (!date) return "unknown";
  const then = typeof date === "string" ? new Date(date) : date;
  const diffSec = (Date.now() - then.getTime()) / 1000;
  if (diffSec < 120) return "fresh";
  if (diffSec < 600) return "stale";
  return "dead";
}
