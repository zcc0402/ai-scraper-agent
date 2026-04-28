import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  planning: "bg-blue-100 text-blue-800",
  navigating: "bg-blue-100 text-blue-800",
  extracting: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
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
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium truncate max-w-[70%]">
              {task.userInput}
            </CardTitle>
            <Badge className={statusColors[task.status] || ""}>
              {task.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {new Date(task.createdAt).toLocaleString("zh-CN")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
