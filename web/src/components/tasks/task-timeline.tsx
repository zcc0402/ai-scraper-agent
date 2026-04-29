import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";

interface TimelineEvent {
  type: string;
  title?: string;
  description?: string;
  status?: string;
}

interface TaskTimelineProps {
  events: TimelineEvent[];
  taskStatus: string;
}

const eventIcons: Record<string, React.ReactNode> = {
  turn_start: <Search className="h-4 w-4" />,
  tool_execution_start: <Globe className="h-4 w-4" />,
  tool_execution_end: <CheckCircle2 className="h-4 w-4" />,
  status: <Clock className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
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

export function TaskTimeline({ events, taskStatus }: TaskTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Agent 执行过程
          <Badge variant="outline" className="ml-auto">
            {statusLabels[taskStatus] || taskStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">等待执行...</p>
          ) : (
            events.map((event, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  {eventIcons[event.type] || <Clock className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {event.title || event.type}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
