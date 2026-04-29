import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SkillCardProps {
  skill: {
    name: string;
    displayName: string;
    description: string;
    version: string;
    type: string;
  };
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{skill.displayName}</CardTitle>
          <Badge variant={skill.type === "native" ? "default" : "secondary"}>
            {skill.type === "native" ? "内置" : "OpenClaw"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{skill.description}</p>
        <p className="text-xs text-muted-foreground">v{skill.version}</p>
      </CardContent>
    </Card>
  );
}
