"use client";

import { useParams } from "next/navigation";
import { AgentWorkspace } from "@/components/agent/workspace";

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId as string;

  return <AgentWorkspace taskId={taskId} />;
}
