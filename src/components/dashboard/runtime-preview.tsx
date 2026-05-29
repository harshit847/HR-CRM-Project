import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlueprintRun } from "@/lib/types";
import { RuntimeRenderer } from "@/runtime/renderer";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

export function RuntimePreview({
  run,
  activePageId,
  onPageChange,
}: {
  run: BlueprintRun;
  activePageId: string;
  onPageChange: (pageId: string) => void;
}) {
  const activePage = run.schemas.ui.find((page) => page.id === activePageId) ?? run.schemas.ui[0];

  return (
    <Card className="h-full overflow-hidden border-border/70 bg-card/70 shadow-soft">
      <CardHeader className="border-b border-border/60">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Runtime Preview</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">Live execution of the generated blueprint</div>
          </div>
          <Badge tone="muted">{run.schemas.ui.length} screens</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="rounded-3xl border border-border/70 bg-background/60 p-3">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Circle className="h-2.5 w-2.5 fill-rose-400 text-rose-400" />
              <Circle className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <Circle className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
            </div>
            <Badge tone="muted">{activePage?.title ?? "Preview"}</Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {run.schemas.ui.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageChange(page.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  activePage?.id === page.id
                    ? "border-sky-400/40 bg-sky-500/15 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
                    : "border-border/70 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>

          <div className="flowforge-scroll mt-4 max-h-[720px] overflow-y-auto pr-1">
            {activePage ? <RuntimeRenderer page={activePage} runtimeData={run.runtimeData} /> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
