import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SamplePrompts({
  prompts,
  onSelect,
}: {
  prompts: readonly string[];
  onSelect: (prompt: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample Prompts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {prompts.map((prompt) => (
          <Button key={prompt} variant="secondary" className="h-auto w-full justify-start whitespace-normal p-3 text-left" onClick={() => onSelect(prompt)}>
            {prompt}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
