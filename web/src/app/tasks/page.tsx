"use client";

import { useEffect, useState } from "react";
import { TaskCard } from "@/components/tasks/task-card";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks?limit=50")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>加载中...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">任务列表</h1>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">暂无任务</p>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
