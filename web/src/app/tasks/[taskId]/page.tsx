"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAgentEvents } from "@/hooks/use-agent-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultsTable } from "@/components/tasks/results-table";
import { TaskTimeline } from "@/components/tasks/task-timeline";
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

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

const formatIcons: Record<string, React.ReactNode> = {
  json: <FileJson className="h-4 w-4" />,
  csv: <FileText className="h-4 w-4" />,
  excel: <FileSpreadsheet className="h-4 w-4" />,
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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const resultData = task.resultData;
  const isArray = Array.isArray(resultData);
  const outputFile = task.outputFile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">任务详情</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date(task.createdAt).toLocaleString("zh-CN")}
          </p>
        </div>
        <Badge variant={statusVariant[taskStatus] || "secondary"}>
          {statusLabels[taskStatus] || taskStatus}
        </Badge>
      </div>

      {/* Task Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">任务描述</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{task.userInput}</p>
        </CardContent>
      </Card>

      {/* Main Content: Timeline + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Timeline */}
        <div className="lg:col-span-1">
          <TaskTimeline events={events} taskStatus={taskStatus} />
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-6">
          {resultData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">结果数据</CardTitle>
                  {outputFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      render={<a href={`/api/tasks/${taskId}/download`} />}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载 {task.outputFormat?.toUpperCase() || "文件"}
                      {formatIcons[task.outputFormat || "json"]}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={isArray ? "table" : "json"}>
                  <TabsList>
                    {isArray && <TabsTrigger value="table">表格</TabsTrigger>}
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  {isArray && (
                    <TabsContent value="table">
                      <ResultsTable data={resultData} />
                    </TabsContent>
                  )}
                  <TabsContent value="json">
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                      {JSON.stringify(resultData, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {task.errorMessage && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-base text-destructive">错误信息</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{task.errorMessage}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
