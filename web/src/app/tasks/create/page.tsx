import { TaskForm } from "@/components/tasks/task-form";

export default function CreateTaskPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">创建爬取任务</h1>
      <TaskForm />
    </div>
  );
}
