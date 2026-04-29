"use client";

import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PanelHeaderProps {
  title: string;
  icon: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  maximized?: boolean;
  onToggleMaximize?: () => void;
  actions?: React.ReactNode;
}

export function PanelHeader({
  title,
  icon,
  collapsed,
  onToggleCollapse,
  maximized,
  onToggleMaximize,
  actions,
}: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between h-10 px-3 border-b bg-muted/30 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        {!collapsed && (
          <span className="text-sm font-medium truncate">{title}</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {actions}
        {onToggleMaximize && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleMaximize}
          >
            {maximized ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapse}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
