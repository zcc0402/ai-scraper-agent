"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SkillDetail } from "@/components/skills/skill-detail";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkillDetailPage() {
  const params = useParams();
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/skills/${params.skillId}`)
      .then((r) => r.json())
      .then((data) => {
        setSkill(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.skillId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">技能未找到</p>
      </div>
    );
  }

  return <SkillDetail skill={skill} />;
}
