"use client";

import { useEffect, useState } from "react";
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
      value: stats?.totalTasks ?? "0",
      icon: Activity,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      label: "已完成",
      value: stats?.completedTasks ?? "0",
      icon: CheckCircle,
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
    },
    {
      label: "运行中",
      value: stats?.runningTasks ?? "0",
      icon: Clock,
      gradient: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
    },
    {
      label: "成功率",
      value: stats ? `${stats.successRate}%` : "0%",
      icon: TrendingUp,
      gradient: "from-violet-500 to-violet-600",
      bgLight: "bg-violet-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} text-white shadow-sm`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </div>
          {/* Decorative gradient */}
          <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full ${item.bgLight} opacity-50`} />
        </div>
      ))}
    </div>
  );
}
