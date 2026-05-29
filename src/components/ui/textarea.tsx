import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/30",
        className,
      )}
      {...props}
    />
  );
}
