"use client";

import { cn } from "@/lib/utils";

interface ScreenshotThumbnailProps {
  index: number;
  url: string;
  isActive: boolean;
  onClick: () => void;
}

export function ScreenshotThumbnail({
  index,
  url,
  isActive,
  onClick,
}: ScreenshotThumbnailProps) {
  return (
    <button
      className={cn(
        "shrink-0 w-16 h-10 rounded border-2 overflow-hidden transition-all hover:scale-110",
        isActive
          ? "border-primary ring-1 ring-primary/30"
          : "border-transparent opacity-60 hover:opacity-100"
      )}
      onClick={onClick}
    >
      <img
        src={url}
        alt={`Screenshot ${index}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </button>
  );
}
