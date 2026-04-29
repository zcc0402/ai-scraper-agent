"use client";

import { useState, useEffect, useCallback } from "react";
import { Globe, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "./panel-header";
import { ScreenshotThumbnail } from "./screenshot-thumbnail";
import { Skeleton } from "@/components/ui/skeleton";

interface Screenshot {
  index: number;
  url: string;
  timestamp: number;
}

interface BrowserPreviewProps {
  taskId: string;
  screenshots: Screenshot[];
  currentStepIndex?: number;
  maximized?: boolean;
  onToggleMaximize?: () => void;
}

export function BrowserPreview({
  taskId,
  screenshots,
  currentStepIndex,
  maximized,
  onToggleMaximize,
}: BrowserPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoFollow, setAutoFollow] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (autoFollow && screenshots.length > 0) {
      setCurrentIndex(screenshots.length - 1);
    }
  }, [screenshots.length, autoFollow]);

  useEffect(() => {
    if (currentStepIndex != null && currentStepIndex < screenshots.length) {
      setCurrentIndex(currentStepIndex);
      setAutoFollow(false);
    }
  }, [currentStepIndex, screenshots.length]);

  const goTo = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < screenshots.length) {
        setCurrentIndex(idx);
        setAutoFollow(false);
      }
    },
    [screenshots.length]
  );

  const current = screenshots[currentIndex];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <PanelHeader
        title="Browser Preview"
        icon={<Globe className="h-4 w-4 text-muted-foreground" />}
        maximized={maximized}
        onToggleMaximize={onToggleMaximize}
        actions={
          screenshots.length > 0 ? (
            <span className="text-xs text-muted-foreground mr-2">
              {currentIndex + 1} / {screenshots.length}
            </span>
          ) : undefined
        }
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-muted/10 min-h-0">
        {screenshots.length === 0 ? (
          <div className="flex flex-col items-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Waiting for screenshots...</p>
            <p className="text-xs mt-1">
              Screenshots will appear as the agent navigates
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 w-full flex items-center justify-center min-h-0">
              {!loaded && (
                <Skeleton className="w-full max-w-2xl aspect-video rounded-lg" />
              )}
              {current && (
                <img
                  src={current.url}
                  alt={`Screenshot ${current.index}`}
                  className={`max-w-full max-h-full object-contain rounded-lg shadow-lg border ${
                    loaded ? "block" : "hidden"
                  }`}
                  onLoad={() => setLoaded(true)}
                />
              )}
            </div>

            <div className="flex items-center gap-4 mt-4 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1 overflow-x-auto max-w-md px-1">
                {screenshots.map((s, i) => (
                  <ScreenshotThumbnail
                    key={s.index}
                    index={s.index}
                    url={s.url}
                    isActive={i === currentIndex}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex >= screenshots.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {!autoFollow && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setAutoFollow(true);
                    setCurrentIndex(screenshots.length - 1);
                  }}
                >
                  Follow latest
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
