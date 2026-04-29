import { TaskForm } from "@/components/tasks/task-form";
import { Sparkles } from "lucide-react";

export default function CreateTaskPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Section */}
      <div className="mb-10 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl" />
        <div className="flex items-center gap-4 mb-3 pt-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">创建任务</h1>
            <p className="text-base text-muted-foreground mt-1">
              用自然语言描述你想抓取的数据，AI 智能完成
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <TaskForm />
    </div>
  );
}
