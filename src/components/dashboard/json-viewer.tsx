import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

export function JsonViewer({
  label,
  value,
  summary,
}: {
  label: string;
  value: unknown;
  summary?: string;
}) {
  return (
    <Collapsible defaultOpen>
      <div className="rounded-2xl border border-border bg-card/80">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left">
          <div>
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{summary ?? "Structured output"}</div>
          </div>
          <Badge tone="muted">
            <ChevronDown className="h-3.5 w-3.5" />
          </Badge>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4">
          <pre className="flowforge-scroll max-h-[320px] max-w-full overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background p-3 text-xs leading-6 text-foreground">
            {JSON.stringify(value, null, 2)}
          </pre>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
