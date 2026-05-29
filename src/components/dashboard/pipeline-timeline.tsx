import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/lib/constants";
import { CheckCircle2, CircleDot, ShieldCheck } from "lucide-react";

export function PipelineTimeline({ completed }: { completed: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage, index) => (
            <div key={stage.id} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3">
              <div className="mt-0.5">
                {completed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : index === 0 ? <CircleDot className="h-4 w-4 text-foreground" /> : <ShieldCheck className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">{stage.label}</div>
                  <Badge tone={completed ? "success" : "muted"}>{completed ? "done" : "ready"}</Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stage.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
