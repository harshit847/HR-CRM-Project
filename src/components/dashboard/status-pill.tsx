import { Badge } from "@/components/ui/badge";

export function StatusPill({ status }: { status: "pass" | "warn" | "fail" | "running" }) {
  if (status === "pass") return <Badge tone="success">Pass</Badge>;
  if (status === "warn") return <Badge tone="warning">Warning</Badge>;
  if (status === "fail") return <Badge tone="danger">Fail</Badge>;
  return <Badge tone="muted">Running</Badge>;
}
