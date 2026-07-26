import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/format";

type Variant = "default" | "accent" | "subtle" | "success" | "warning" | "danger";

const VARIANTS: Record<string, Variant> = {
  // bills
  paid: "success",
  pending: "warning",
  overdue: "danger",
  void: "subtle",
  // units
  occupied: "success",
  vacant: "warning",
  maintenance: "danger",
  // tenants
  current: "success",
  ended: "subtle",
  // cheques
  deposited: "success",
  bounced: "danger",
  // improvements
  approved: "success",
  rejected: "danger",
  completed: "accent",
  // announcements
  sent: "success",
  draft: "warning",
  // audit
  create: "success",
  update: "warning",
  delete: "danger",
  login: "subtle",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <Badge variant={VARIANTS[status] ?? "subtle"}>{label ?? titleCase(status)}</Badge>;
}
