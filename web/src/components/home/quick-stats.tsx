"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface Stats {
  totalTasks: number;
  completedTasks: number;
  runningTasks: number;
  successRate: number;
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const statItems = [
    {
      label: "总任务数",
      value: stats?.totalTasks ?? "-",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "已完成",
      value: stats?.completedTasks ?? "-",
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "运行中",
      value: stats?.runningTasks ?? "-",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "成功率",
      value: stats ? `${stats.successRate}%` : "-",
      icon: TrendingUp,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
