import type { BlueprintRun } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SchemaTabs({
  run,
  activeTab,
  onTabChange,
}: {
  run: BlueprintRun;
  activeTab: "ui" | "api" | "db" | "auth";
  onTabChange: (tab: "ui" | "api" | "db" | "auth") => void;
}) {
  const schemaMap = {
    ui: run.schemas.ui,
    api: run.schemas.api,
    db: run.schemas.db,
    auth: run.schemas.auth,
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as typeof activeTab)}>
      <TabsList className="w-full flex-wrap gap-1">
        {(["ui", "api", "db", "auth"] as const).map((tab) => (
          <TabsTrigger key={tab} active={activeTab === tab} onClick={() => onTabChange(tab)}>
            {tab.toUpperCase()}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent className="mt-4">
        <pre className="flowforge-scroll max-h-[380px] max-w-full overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-border bg-background p-4 text-xs leading-6 text-foreground">
          {JSON.stringify(schemaMap[activeTab], null, 2)}
        </pre>
      </TabsContent>
    </Tabs>
  );
}
