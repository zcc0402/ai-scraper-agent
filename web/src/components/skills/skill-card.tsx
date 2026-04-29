import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Puzzle, ArrowRight } from "lucide-react";

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
    <Link href={`/skills/${skill.name}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Puzzle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{skill.displayName}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {skill.type === "native" ? "内置" : skill.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    v{skill.version}
                  </span>
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {skill.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
