import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/format";

type Variant = "default" | "accent" | "subtle" | "success" | "warning" | "danger";

const VARIANTS: Record<string, Variant> = {
  // invoices
  paid: "success",
  pending: "warning",
  overdue: "danger",
  void: "subtle",
  // units
  occupied: "success",
  vacant: "warning",
  reserved: "subtle",
  maintenance: "danger",
  // residents
  active: "success",
  expiring: "danger",
  blacklisted: "subtle",
  "moved-out": "subtle",
  // announcements
  sent: "success",
  draft: "warning",
  // bookings
  approved: "success",
  rejected: "danger",
  cancelled: "subtle",
  completed: "accent",
  // audit
  create: "success",
  update: "warning",
  delete: "danger",
  login: "subtle",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <Badge variant={VARIANTS[status] ?? "subtle"}>{label ?? titleCase(status)}</Badge>;
}
