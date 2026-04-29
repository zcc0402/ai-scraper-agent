"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Puzzle,
  ArrowLeft,
  Zap,
  Tag,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface SkillDetailProps {
  skill: {
    name: string;
    displayName: string;
    description: string;
    version: string;
    type: string;
  };
}

export function SkillDetail({ skill }: SkillDetailProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/skills">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回技能市场
        </Button>
      </Link>

      {/* Skill Header */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Puzzle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{skill.displayName}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {skill.type === "native" ? "内置" : skill.type}
                  </Badge>
                  <Badge variant="outline">v{skill.version}</Badge>
                </div>
              </div>
            </div>
            <Link href="/tasks/create">
              <Button className="gap-2">
                <Zap className="h-4 w-4" />
                使用此技能
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {skill.description}
          </p>
        </CardContent>
      </Card>

      {/* Skill Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">技能信息</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">名称</span>
                <span className="text-sm font-medium">{skill.name}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">版本</span>
                <span className="text-sm font-medium">{skill.version}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">类型</span>
                <span className="text-sm font-medium">
                  {skill.type === "native" ? "内置技能" : skill.type}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold">功能特性</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                自然语言任务描述
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                智能数据提取
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                多格式输出支持
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Usage Example */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">使用示例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground"># 示例任务描述</p>
            <p className="mt-2">抓取 Hacker News 前10条标题和链接</p>
            <p className="mt-1">返回字段：title, url, score</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
