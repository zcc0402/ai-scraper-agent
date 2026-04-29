"use client";

import { useState } from "react";
import {
  Globe,
  Scan,
  MousePointerClick,
  Type,
  ArrowUpDown,
  Camera,
  Timer,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolIcons: Record<string, React.ReactNode> = {
  navigate: <Globe className="h-4 w-4 text-blue-500" />,
  snapshot: <Scan className="h-4 w-4 text-purple-500" />,
  click: <MousePointerClick className="h-4 w-4 text-orange-500" />,
  fill: <Type className="h-4 w-4 text-cyan-500" />,
  scroll: <ArrowUpDown className="h-4 w-4 text-gray-500" />,
  screenshot: <Camera className="h-4 w-4 text-green-500" />,
  wait_for: <Timer className="h-4 w-4 text-yellow-500" />,
};

type ToolStatus = "running" | "success" | "failed" | "pending";

interface ToolCallCardProps {
  name: string;
  args?: Record<string, unknown>;
  result?: unknown;
  error?: string;
  duration?: number;
  status: ToolStatus;
  isActive?: boolean;
  onClick?: () => void;
}

function summarizeArgs(args?: Record<string, unknown>): string {
  if (!args) return "";
  const entries = Object.entries(args);
  if (entries.length === 0) return "";
  const [key, value] = entries[0];
  const str = typeof value === "string" ? value : JSON.stringify(value);
  return `${key}: ${str.length > 40 ? str.slice(0, 40) + "..." : str}`;
}

export function ToolCallCard({
  name,
  args,
  result,
  error,
  duration,
  status,
  isActive,
  onClick,
}: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);

  const borderColor = {
    running: "border-l-blue-500",
    success: "border-l-green-500",
    failed: "border-l-red-500",
    pending: "border-l-gray-300 border-l-dashed",
  }[status];

  return (
    <div
      className={cn(
        "border-l-2 bg-card rounded-r-md transition-all",
        borderColor,
        isActive && "ring-1 ring-primary/30",
        status === "running" && "animate-pulse"
      )}
    >
      <button
        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-muted/50 transition-colors"
        onClick={() => {
          setExpanded(!expanded);
          onClick?.();
        }}
      >
        <div className="shrink-0">
          {status === "running" ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : status === "failed" ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-400" />
          )}
        </div>

        <div className="shrink-0">{toolIcons[name] || <Globe className="h-4 w-4" />}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{name}</span>
            {duration != null && (
              <span className="text-xs text-muted-foreground">
                {(duration / 1000).toFixed(1)}s
              </span>
            )}
          </div>
          {args && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {summarizeArgs(args)}
            </p>
          )}
        </div>

        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="px-3 pb-2 space-y-2 border-t">
          {args && Object.keys(args).length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Parameters</p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(args, null, 2)}
              </pre>
            </div>
          )}
          {result != null && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Result</p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {typeof result === "string"
                  ? result.slice(0, 500)
                  : JSON.stringify(result, null, 2).slice(0, 500)}
              </pre>
            </div>
          )}
          {error && (
            <div>
              <p className="text-xs font-medium text-red-500 mb-1">Error</p>
              <pre className="text-xs bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2 rounded overflow-auto max-h-32">
                {error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
