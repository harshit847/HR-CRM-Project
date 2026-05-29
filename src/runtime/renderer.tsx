import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UiComponent, UiPage } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function ComponentFrame({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function renderStats(component: UiComponent) {
  const metrics = Array.isArray(component.props.metrics) ? component.props.metrics : [];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {metrics.map((metric, index) => (
        <div key={`${component.id}-${index}`} className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{String(metric.label)}</div>
          <div className="mt-2 text-xl font-semibold text-foreground">{String(metric.value)}</div>
        </div>
      ))}
    </div>
  );
}

function renderTable(component: UiComponent, rows: Array<Record<string, string | number | boolean>>) {
  const columns = Array.isArray(component.props.columns)
    ? (component.props.columns as string[])
    : rows[0]
      ? Object.keys(rows[0])
      : [];
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {rows.map((row, rowIndex) => (
            <tr key={`${component.id}-${rowIndex}`}>
              {columns.map((column) => (
                <td key={`${component.id}-${rowIndex}-${column}`} className="px-4 py-3 text-foreground">
                  {String(row[column] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderForm(component: UiComponent) {
  const fields = Array.isArray(component.props.fields) ? (component.props.fields as string[]) : [];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={`${component.id}-${field}`} className="space-y-1.5 rounded-xl border border-border bg-background p-3">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{field}</div>
          <div className="h-10 rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {field}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderChart(component: UiComponent) {
  const bars = [
    { label: "Mon", value: 24 },
    { label: "Tue", value: 38 },
    { label: "Wed", value: 32 },
    { label: "Thu", value: 46 },
    { label: "Fri", value: 58 },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex-1">
            <div className="mb-2 text-center text-xs text-muted-foreground">{bar.label}</div>
            <div className="rounded-t-xl bg-foreground/80" style={{ height: `${bar.value}px` }} />
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">Derived from {String(component.props.metric ?? "system")}</div>
    </div>
  );
}

function renderTimeline(component: UiComponent) {
  const items = Array.isArray(component.props.items) ? (component.props.items as string[]) : [];
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${component.id}-${index}`} className="flex gap-3">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-foreground" />
          <div className="text-sm text-foreground">{item}</div>
        </div>
      ))}
    </div>
  );
}

function renderSidebar(component: UiComponent) {
  const items = Array.isArray(component.props.items) ? (component.props.items as string[]) : [];
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${component.id}-${index}`} className="rounded-xl border border-border bg-muted/25 px-3 py-2 text-sm text-foreground">
          {item}
        </div>
      ))}
    </div>
  );
}

export function RuntimeRenderer({
  page,
  runtimeData,
}: {
  page: UiPage;
  runtimeData: Record<string, Array<Record<string, string | number | boolean>>>;
}) {
  return (
    <div className="space-y-4 pb-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Runtime preview</div>
          <h3 className="mt-1 text-lg font-semibold text-foreground">{page.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{page.description}</p>
        </div>
        <Badge tone="muted">{page.route}</Badge>
      </div>

      <div className="grid gap-3">
        {page.components.map((component) => {
          const rows = component.entity ? runtimeData[component.entity] ?? [] : [];
          if (component.type === "sidebar") {
            return (
              <ComponentFrame key={component.id} title={component.title}>
                {renderSidebar(component)}
              </ComponentFrame>
            );
          }
          if (component.type === "header") {
            return (
              <ComponentFrame key={component.id} title={component.title}>
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {String(component.props.eyebrow ?? "Header")}
                  </div>
                  <p className="text-sm text-foreground">{String(component.props.description ?? "")}</p>
                </div>
              </ComponentFrame>
            );
          }
          if (component.type === "stats") {
            return (
              <ComponentFrame key={component.id} title={component.title}>
                {renderStats(component)}
              </ComponentFrame>
            );
          }
          if (component.type === "table") {
            return (
              <ComponentFrame key={component.id} title={component.title}>
                {renderTable(component, rows)}
              </ComponentFrame>
            );
          }
          if (component.type === "form") {
            return (
              <ComponentFrame key={component.id} title={component.title}>
                {renderForm(component)}
              </ComponentFrame>
            );
          }
          if (component.type === "chart") {
            return (
              <ComponentFrame key={component.id} title={component.title}>
                {renderChart(component)}
              </ComponentFrame>
            );
          }
          if (component.type === "timeline") {
            return (
              <ComponentFrame key={component.id} title={component.title}>
                {renderTimeline(component)}
              </ComponentFrame>
            );
          }
          if (component.type === "card") {
            return (
              <ComponentFrame key={component.id} title={component.title}>
                <div className="text-sm text-muted-foreground">{String(component.props.body ?? "Generated card.")}</div>
              </ComponentFrame>
            );
          }
          return (
            <ComponentFrame key={component.id} title={component.title}>
              <div className="text-sm text-muted-foreground">Unsupported runtime component.</div>
            </ComponentFrame>
          );
        })}
      </div>
    </div>
  );
}
