"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Task {
  id: string;
  userInput: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  running: "bg-blue-500/10 text-blue-500",
  completed: "bg-emerald-500/10 text-emerald-500",
  failed: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "等待中",
  running: "运行中",
  completed: "已完成",
  failed: "失败",
};

export function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch("/api/tasks?limit=5")
      .then((r) => r.json())
      .then(setTasks)
      .catch(() => {});
  }, []);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">最近任务</CardTitle>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-1">
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            暂无任务，创建你的第一个爬虫任务吧
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {task.userInput}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(task.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={statusColors[task.status] || ""}
                >
                  {statusLabels[task.status] || task.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
