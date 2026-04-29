"use client";

import { useRef, useEffect } from "react";
import { Bot, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelHeader } from "./panel-header";
import { ToolCallCard } from "./tool-call-card";
import { AgentMessage } from "./agent-message";
import type { AgentEvent } from "@/hooks/use-agent-events";

interface AgentPanelProps {
  events: AgentEvent[];
  taskStatus: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  maximized?: boolean;
  onToggleMaximize?: () => void;
  activeStepIndex?: number;
  onStepClick?: (index: number) => void;
}

function getToolStatus(
  event: AgentEvent,
  isLast: boolean,
  taskStatus: string
): "running" | "success" | "failed" | "pending" {
  if (event.type === "tool_execution_start") {
    return taskStatus === "failed" && isLast ? "failed" : "running";
  }
  if (event.type === "tool_execution_end") {
    return event.toolCall?.error ? "failed" : "success";
  }
  return "pending";
}

export function AgentPanel({
  events,
  taskStatus,
  collapsed,
  onToggleCollapse,
  maximized,
  onToggleMaximize,
  activeStepIndex,
  onStepClick,
}: AgentPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScroll = useRef(true);

  useEffect(() => {
    if (autoScroll.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const toolEvents = events.filter(
    (e) => e.type === "tool_execution_start" || e.type === "tool_execution_end"
  );
  const completedCount = toolEvents.filter(
    (e) => e.type === "tool_execution_end" && !e.toolCall?.error
  ).length;
  const failedCount = toolEvents.filter(
    (e) => e.type === "tool_execution_end" && e.toolCall?.error
  ).length;

  if (collapsed) {
    return (
      <div className="w-12 border-r bg-muted/20 flex flex-col items-center py-2 gap-2">
        <Bot className="h-5 w-5 text-muted-foreground" />
        <div className="text-xs text-muted-foreground" style={{ writingMode: "vertical-rl" }}>
          Agent
        </div>
      </div>
    );
  }

  return (
    <div className="w-[280px] border-r flex flex-col bg-background shrink-0">
      <PanelHeader
        title="Agent"
        icon={<Bot className="h-4 w-4" />}
        onToggleCollapse={onToggleCollapse}
        maximized={maximized}
        onToggleMaximize={onToggleMaximize}
      />

      <div className="flex items-center gap-3 px-3 py-1.5 border-b text-xs text-muted-foreground bg-muted/20">
        <span>Steps: {toolEvents.length}</span>
        <span className="text-green-600">Done: {completedCount}</span>
        {failedCount > 0 && (
          <span className="text-red-500">Fail: {failedCount}</span>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div
          ref={scrollRef}
          className="py-2 space-y-1"
          onScroll={(e) => {
            const el = e.currentTarget;
            autoScroll.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 50;
          }}
        >
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Zap className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Waiting for agent...</p>
            </div>
          )}

          {events.map((event, i) => {
            if (
              event.type === "tool_execution_start" ||
              event.type === "tool_execution_end"
            ) {
              const toolName = event.toolCall?.name || event.title || "unknown";
              const isRunning = event.type === "tool_execution_start";
              const endEvent = !isRunning ? event : null;
              const isLast = i === events.length - 1;

              return (
                <ToolCallCard
                  key={i}
                  name={toolName}
                  args={event.toolCall?.args}
                  result={endEvent?.toolCall?.result}
                  error={endEvent?.toolCall?.error as string | undefined}
                  duration={endEvent?.toolCall?.duration}
                  status={getToolStatus(event, isLast, taskStatus)}
                  isActive={activeStepIndex === i}
                  onClick={() => onStepClick?.(i)}
                />
              );
            }

            if (event.type === "turn_start" || event.type === "status") {
              return null;
            }

            if (event.description) {
              return <AgentMessage key={i} content={event.description} />;
            }

            return null;
          })}

          {taskStatus === "running" && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Agent is working...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
