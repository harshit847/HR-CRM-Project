import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "muted" | "success" | "warning" | "danger";
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone === "default" && "border-border bg-card text-foreground",
        tone === "muted" && "border-border bg-muted text-muted-foreground",
        tone === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
        tone === "warning" && "border-amber-500/20 bg-amber-500/10 text-amber-700",
        tone === "danger" && "border-rose-500/20 bg-rose-500/10 text-rose-700",
        className,
      )}
      {...props}
    />
  );
}
