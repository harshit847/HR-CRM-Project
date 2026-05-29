import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "default", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "border-transparent bg-foreground text-background shadow-soft hover:translate-y-[-1px] hover:opacity-95",
        variant === "secondary" && "border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
        variant === "ghost" && "border-transparent bg-transparent text-foreground hover:bg-accent/70 hover:text-accent-foreground",
        variant === "outline" && "border-border bg-transparent text-foreground hover:bg-card",
        size === "sm" && "h-8 px-3",
        size === "md" && "h-10 px-4",
        size === "lg" && "h-11 px-5",
        className,
      )}
      {...props}
    />
  );
}
