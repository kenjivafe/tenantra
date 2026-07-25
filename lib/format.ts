const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number) {
  return peso.format(Math.round(amount));
}

/** Compact peso amount for stat tiles: ₱4.2M, ₱156K, ₱980. */
export function formatMoneyCompact(amount: number) {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `₱${Math.round(amount / 1_000)}K`;
  return `₱${Math.round(amount)}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatDelta(value: number, digits = 1) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

/** Dates are rendered in a fixed locale/zone so server and client markup agree. */
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const shortDateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  return dateFmt.format(new Date(iso));
}

export function formatShortDate(iso: string | null) {
  if (!iso) return "—";
  return shortDateFmt.format(new Date(iso));
}

export function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return dateTimeFmt.format(new Date(iso));
}

/** `2026-07` -> `July 2026` */
export function formatPeriod(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

/** `2026-07` -> `Jul` */
export function formatPeriodShort(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

export function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${suffix}`;
}

export function formatTimeRange(start: number, end: number) {
  return `${formatHour(start)} - ${formatHour(end)}`;
}

export function formatRelative(iso: string, now = Date.now()) {
  const diff = now - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export function titleCase(value: string) {
  return value
    .split(/[-\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
