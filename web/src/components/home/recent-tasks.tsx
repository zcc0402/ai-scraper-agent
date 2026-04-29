"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
  running: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500 animate-pulse" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  failed: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
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
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/30">
        <h3 className="text-sm font-semibold">最近任务</h3>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
            查看全部
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
      <div className="p-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="p-3 rounded-full bg-muted/50 mb-3">
              <ListTodo className="h-6 w-6 text-muted-foreground/70" />
            </div>
            <p className="text-sm font-medium mb-1">暂无任务</p>
            <p className="text-xs text-muted-foreground mb-4">创建你的第一个爬虫任务吧</p>
            <Link href="/tasks/create">
              <Button size="sm" className="gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />
                创建任务
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => {
              const status = statusStyles[task.status] || statusStyles.pending;
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
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
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${status.bg} ${status.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {statusLabels[task.status] || task.status}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
