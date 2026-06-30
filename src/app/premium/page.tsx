"use client";

import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const features = [
  {
    name: "AI Blueprint Generation",
    free: true,
    pro: true,
    description: "Generate app blueprints from natural language prompts",
  },
  {
    name: "Runtime Preview",
    free: true,
    pro: true,
    description: "Preview generated UI in real-time",
  },
  {
    name: "Pipeline Evaluations",
    free: true,
    pro: true,
    description: "View pipeline metrics and evaluation data",
  },
  {
    name: "Unlimited Blueprints",
    free: false,
    pro: true,
    description: "Generate unlimited blueprints per day",
  },
  {
    name: "Advanced AI Models",
    free: false,
    pro: true,
    description: "Access to GPT-4.1 and advanced extraction",
  },
  {
    name: "Priority Support",
    free: false,
    pro: true,
    description: "Priority email and chat support",
  },
  {
    name: "Custom Integrations",
    free: false,
    pro: true,
    description: "Custom API and webhook integrations",
  },
  {
    name: "Team Collaboration",
    free: false,
    pro: true,
    description: "Share blueprints and collaborate with your team",
  },
];

export default function PremiumPage() {
  const { user, loading } = useAuth();
  const isPro = user?.plan === "PRO";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          FlowForge AI Plans
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose the plan that fits your needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free
              {!loading && user && !isPro && (
                <Badge tone="muted">Current</Badge>
              )}
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">$0</span>
              /month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature.name} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 shrink-0">
                    {feature.free ? (
                      <span className="text-emerald-500">✓</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </span>
                  <div>
                    <span className="text-foreground">{feature.name}</span>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            {!loading && user && !isPro && (
              <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/60">
                🔒 This is a Pro feature. Upgrade coming soon.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-blue-500/30">
          <div className="absolute top-0 right-0">
            <Badge tone="success" className="rounded-tr-none rounded-br-none rounded-tl-none rounded-bl-sm">
              PRO
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pro
              {!loading && user && isPro && (
                <Badge tone="success">Current</Badge>
              )}
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-foreground">Coming Soon</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {features.map((feature) => {
                const locked = !feature.free && !isPro;
                return (
                  <li
                    key={feature.name}
                    className={`flex items-start gap-3 text-sm ${locked ? "opacity-50" : ""}`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {isPro || feature.free ? (
                        <span className="text-emerald-500">✓</span>
                      ) : (
                        <span className="text-rose-500">✗</span>
                      )}
                    </span>
                    <div>
                      <span className="text-foreground">{feature.name}</span>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                      {locked && (
                        <p className="text-xs text-rose-500 mt-0.5">
                          🔒 This is a Pro feature. Upgrade coming soon.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {!loading && user && !isPro && (
              <div className="pt-2 border-t border-border/60">
                <p className="text-xs text-muted-foreground text-center">
                  🔒 This is a Pro feature. Upgrade coming soon.
                </p>
              </div>
            )}
            {!loading && (!user || isPro) && (
              <Button className="w-full" disabled>
                {isPro ? "Current Plan" : "Sign in to upgrade"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
