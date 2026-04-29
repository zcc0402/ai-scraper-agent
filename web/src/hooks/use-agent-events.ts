"use client";

import { useEffect, useState } from "react";

export interface AgentEvent {
  type: string;
  title?: string;
  description?: string;
  snapshot?: string;
  toolCall?: {
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
    error?: unknown;
    duration?: number;
  };
  status?: string;
  result?: unknown;
  [key: string]: unknown;
}

export function useAgentEvents(taskId: string) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [taskStatus, setTaskStatus] = useState<string>("pending");

  useEffect(() => {
    const source = new EventSource(`/api/tasks/${taskId}/events`);

    source.onmessage = (e) => {
      try {
        const event: AgentEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev, event]);

        if (event.type === "status" && event.status) {
          setTaskStatus(event.status as string);
        }
        if (event.type === "completed" || event.type === "failed") {
          setTaskStatus(event.type);
        }
      } catch {
        // heartbeat
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  }, [taskId]);

  return { events, taskStatus };
}
