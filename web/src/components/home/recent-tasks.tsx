"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, ListTodo, PlusCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Task {
  id: string;
  userInput: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  running: "bg-blue-50 text-blue-600",
  completed: "bg-emerald-50 text-emerald-600",
  failed: "bg-red-50 text-red-600",
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
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium">最近任务</CardTitle>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
            查看全部
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <ListTodo className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">暂无任务</p>
            <p className="text-xs text-muted-foreground mb-4">创建你的第一个爬虫任务吧</p>
            <Link href="/tasks/create">
              <Button size="sm" variant="outline" className="gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />
                创建任务
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm truncate">{task.userInput}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(task.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[11px] px-2 py-0.5 ${statusColors[task.status] || ""}`}
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
