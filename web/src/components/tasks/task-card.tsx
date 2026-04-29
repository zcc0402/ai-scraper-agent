import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  };
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="font-medium truncate">{task.userInput}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {new Date(task.createdAt).toLocaleString("zh-CN")}
              </p>
            </div>
            <Badge variant={statusVariant[task.status] || "secondary"}>
              {statusLabels[task.status] || task.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
