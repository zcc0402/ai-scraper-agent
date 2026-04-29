"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Maximize2,
  Minimize2,
  Loader2,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentPanel } from "./agent-panel";
import { BrowserPreview } from "./browser-preview";
import { ResultsPanel } from "./results-panel";
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

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  running: "default",
  planning: "default",
  navigating: "default",
  extracting: "default",
  completed: "default",
  failed: "destructive",
  cancelled: "outline",
};

interface AgentWorkspaceProps {
  taskId: string;
}

export function AgentWorkspace({ taskId }: AgentWorkspaceProps) {
  const { events, taskStatus: liveStatus } = useAgentEvents(taskId);
  const [task, setTask] = useState<any>(null);

  // Use live status if available, otherwise fall back to task's stored status
  const taskStatus = liveStatus !== "pending" ? liveStatus : (task?.status || "pending");
  const [screenshots, setScreenshots] = useState<
    { index: number; url: string; timestamp: number }[]
  >([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number | undefined>();
  const [fullscreen, setFullscreen] = useState(false);
  const [maximizedPanel, setMaximizedPanel] = useState<
    "left" | "center" | "right" | null
  >(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then(setTask);
  }, [taskId]);

  useEffect(() => {
    const loadScreenshots = () => {
      fetch(`/api/tasks/${taskId}/screenshots`)
        .then((r) => r.json())
        .then((data) => setScreenshots(data.screenshots || []))
        .catch(() => {});
    };
    loadScreenshots();
    const interval = setInterval(loadScreenshots, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  useEffect(() => {
    if (
      taskStatus === "running" ||
      taskStatus === "planning" ||
      taskStatus === "navigating" ||
      taskStatus === "extracting"
    ) {
      const start = task?.createdAt ? new Date(task.createdAt).getTime() : Date.now();
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [taskStatus, task?.createdAt]);

  // Set elapsed time for completed/failed tasks once task data loads
  useEffect(() => {
    if (task?.createdAt && task?.completedAt) {
      const duration = Math.abs(Math.floor(
        (new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()) / 1000
      ));
      setElapsed(duration);
    }
  }, [task?.createdAt, task?.completedAt]);

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const toggleMaximize = useCallback(
    (panel: "left" | "center" | "right") => {
      setMaximizedPanel((prev) => (prev === panel ? null : panel));
    },
    []
  );

  const isRunning =
    taskStatus === "running" ||
    taskStatus === "planning" ||
    taskStatus === "navigating" ||
    taskStatus === "extracting" ||
    taskStatus === "exporting";

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <div className="h-12 border-b flex items-center justify-between px-4 shrink-0 bg-background">
        <div className="flex items-center gap-3">
          <Link href="/tasks">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-sm font-semibold truncate max-w-md">
            {task?.userInput || "Loading..."}
          </h1>
          <Badge variant={statusVariant[taskStatus] || "secondary"} className="text-xs">
            {isRunning && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            {taskStatus === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {taskStatus === "failed" && <XCircle className="h-3 w-3 mr-1" />}
            {statusLabels[taskStatus] || taskStatus}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {(isRunning || taskStatus === "completed" || taskStatus === "failed") && elapsed > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatElapsed(elapsed)}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setFullscreen(!fullscreen)}
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {(maximizedPanel === null || maximizedPanel === "left") && (
          <AgentPanel
            events={events}
            taskStatus={taskStatus}
            collapsed={leftCollapsed && maximizedPanel === null}
            onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
            maximized={maximizedPanel === "left"}
            onToggleMaximize={() => toggleMaximize("left")}
            activeStepIndex={activeStepIndex}
            onStepClick={setActiveStepIndex}
          />
        )}

        {(maximizedPanel === null || maximizedPanel === "center") && (
          <BrowserPreview
            taskId={taskId}
            screenshots={screenshots}
            currentStepIndex={activeStepIndex}
            maximized={maximizedPanel === "center"}
            onToggleMaximize={() => toggleMaximize("center")}
          />
        )}

        {(maximizedPanel === null || maximizedPanel === "right") && (
          <ResultsPanel
            taskId={taskId}
            resultData={task?.resultData}
            outputFormat={task?.outputFormat}
            collapsed={rightCollapsed && maximizedPanel === null}
            onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
            maximized={maximizedPanel === "right"}
            onToggleMaximize={() => toggleMaximize("right")}
          />
        )}
      </div>
    </div>
  );
}
