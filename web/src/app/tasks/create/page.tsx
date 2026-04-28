import { TaskForm } from "@/components/tasks/task-form";

export default function CreateTaskPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">创建爬取任务</h1>
          <p className="text-[#94A3B8] text-lg">用自然语言描述你想抓取的数据</p>
        </div>
        <TaskForm />
      </div>
    </div>
  );
}
