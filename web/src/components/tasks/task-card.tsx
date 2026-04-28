import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "等待中", color: "text-[#FBBF24]", bg: "bg-[#FBBF24]/10" },
  running: { label: "运行中", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
  planning: { label: "规划中", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
  navigating: { label: "导航中", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
  extracting: { label: "提取中", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
  completed: { label: "已完成", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
  failed: { label: "失败", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  cancelled: { label: "已取消", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10" },
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
  const status = statusConfig[task.status] || statusConfig.pending;

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="group p-5 bg-[#1E293B] border border-[#475569] rounded-lg hover:border-[#22C55E]/30 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-[#F8FAFC] font-medium truncate">{task.userInput}</p>
            <p className="text-[#64748B] text-sm mt-1">
              {new Date(task.createdAt).toLocaleString("zh-CN")}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-md ${status.bg}`}>
            <span className={`text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
