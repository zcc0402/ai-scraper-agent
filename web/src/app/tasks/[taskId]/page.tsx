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

  if (!task) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#F8FAFC]">任务详情</h1>
          <span className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            taskStatus === "completed" ? "bg-[#22C55E]/10 text-[#22C55E]" :
            taskStatus === "failed" ? "bg-[#EF4444]/10 text-[#EF4444]" :
            "bg-[#3B82F6]/10 text-[#3B82F6]"
          }`}>
            {statusLabels[taskStatus] || taskStatus}
          </span>
        </div>

        <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">任务描述</h2>
          <p className="text-[#94A3B8]">{task.userInput}</p>
        </div>

        <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Agent 执行过程</h2>
          <div className="space-y-3">
            {events.map((event, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="font-mono text-xs text-[#64748B] w-24 shrink-0">
                  {event.type}
                </span>
                <span className="text-[#94A3B8]">
                  {event.title || event.description || JSON.stringify(event).slice(0, 100)}
                </span>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-[#64748B]">等待执行...</p>
            )}
          </div>
        </div>

        {task.resultData && (
          <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">结果数据</h2>
            <pre className="bg-[#0F172A] p-4 rounded-lg overflow-auto max-h-96 text-sm text-[#94A3B8]">
              {JSON.stringify(task.resultData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
