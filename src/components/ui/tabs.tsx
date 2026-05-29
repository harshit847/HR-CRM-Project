import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
};

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <div
      data-tabs-value={value}
      data-on-value-change={typeof onValueChange === "function" ? "yes" : "no"}
      className="space-y-3"
    >
      {children}
    </div>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex max-w-full flex-wrap rounded-xl border border-border bg-muted/50 p-1", className)} {...props} />;
}

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function TabsTrigger({ className, active, ...props }: TabsTriggerProps) {
  return (
    <button
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm transition",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("outline-none", className)} {...props} />;
}
