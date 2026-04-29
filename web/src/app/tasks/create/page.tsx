import { TaskForm } from "@/components/tasks/task-form";

export default function CreateTaskPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">创建任务</h1>
      <TaskForm />
    </div>
  );
}
