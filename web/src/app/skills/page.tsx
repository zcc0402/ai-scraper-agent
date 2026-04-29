"use client";

import { useEffect, useState } from "react";
import { SkillCard } from "@/components/skills/skill-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Puzzle, Filter } from "lucide-react";

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => {
        setSkills(data);
        setLoading(false);
      });
  }, []);

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      !search ||
      skill.displayName.toLowerCase().includes(search.toLowerCase()) ||
      skill.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || skill.type === selectedType;
    return matchesSearch && matchesType;
  });

  const skillTypes = Array.from(new Set(skills.map((s) => s.type)));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Puzzle className="h-6 w-6 text-primary" />
          Skill 市场
        </h1>
        <p className="text-muted-foreground mt-1">
          发现和安装爬虫技能，扩展 AI Scraper 的能力
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索技能..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant={selectedType === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedType(null)}
          >
            全部
          </Badge>
          {skillTypes.map((type) => (
            <Badge
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedType(type === selectedType ? null : type)}
            >
              {type === "native" ? "内置" : type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="text-center py-12">
          <Puzzle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {search ? "没有找到匹配的技能" : "暂无可用技能"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
