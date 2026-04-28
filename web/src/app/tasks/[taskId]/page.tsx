"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAgentEvents } from "@/hooks/use-agent-events";

const statusLabels: Record<string, string> = {
  pending: "等待中",
  running: "运行中",
  planning: "规划中",
  navigating: "导航中",
  extracting: "提取中",
  validating: "验证中",
  exporting: "导出中",
  completed: "已完成",
  failed: "失败",
  cancelled: "已取消",
};

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<any>(null);
  const { events, taskStatus } = useAgentEvents(taskId);

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then(setTask);
  }, [taskId]);

  if (!task) return <p>加载中...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">任务详情</h1>
        <Badge>{statusLabels[taskStatus] || taskStatus}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">任务描述</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{task.userInput}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agent 执行过程</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                  {event.type}
                </span>
                <span>{event.title || event.description || JSON.stringify(event).slice(0, 100)}</span>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-muted-foreground">等待执行...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {task.resultData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">结果数据</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
              {JSON.stringify(task.resultData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
