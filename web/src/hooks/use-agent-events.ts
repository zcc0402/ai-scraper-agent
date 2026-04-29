"use client";

import { useEffect, useState, useCallback } from "react";

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

  // Load persisted events from history API
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/history`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.events?.length > 0) {
        setEvents(data.events);
        // Derive status from last event
        const last = data.events[data.events.length - 1];
        if (last.type === "completed") setTaskStatus("completed");
        else if (last.type === "failed") setTaskStatus("failed");
      }
    } catch {
      // ignore
    }
  }, [taskId]);

  useEffect(() => {
    // Always try loading history first for persisted events
    loadHistory();

    // Then connect to SSE for live updates
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
  }, [taskId, loadHistory]);

  return { events, taskStatus };
}
