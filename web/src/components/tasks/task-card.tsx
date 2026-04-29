"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";

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

interface TaskCardProps {
  task: {
    id: string;
    userInput: string;
    status: string;
    createdAt: string;
    completedAt?: string | null;
    resultData?: unknown;
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tasks/${task.id}/screenshots`)
      .then((r) => r.json())
      .then((data) => {
        const screenshots = data.screenshots || [];
        if (screenshots.length > 0) {
          setThumbnailUrl(screenshots[screenshots.length - 1].url);
        }
      })
      .catch(() => {});
  }, [task.id]);

  const resultCount = Array.isArray(task.resultData)
    ? task.resultData.length
    : null;

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="shrink-0 w-40 h-[100px] rounded-md overflow-hidden bg-muted flex items-center justify-center">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Task preview"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{task.userInput}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={statusVariant[task.status] || "secondary"}>
                  {statusLabels[task.status] || task.status}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {new Date(task.createdAt).toLocaleString("zh-CN")}
                </span>
              </div>
              {resultCount != null && (
                <p className="text-sm text-muted-foreground mt-1.5">
                  提取: {resultCount} 条记录
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
