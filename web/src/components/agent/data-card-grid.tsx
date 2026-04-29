"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DataCardGridProps {
  data: Record<string, unknown>[];
}

function FieldPreview({ value }: { value: unknown }) {
  if (value == null) {
    return <span className="text-muted-foreground italic">null</span>;
  }
  if (typeof value === "number") {
    return <span className="font-mono text-lg font-semibold">{value}</span>;
  }
  if (typeof value === "string") {
    if (value.match(/^https?:\/\//)) {
      return (
        <span className="flex items-center gap-1 text-blue-500">
          <ExternalLink className="h-3 w-3" />
          {new URL(value).hostname}
        </span>
      );
    }
    if (value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return (
        <img src={value} alt="" className="h-16 w-full object-cover rounded" />
      );
    }
    return (
      <span className="text-sm line-clamp-2">
        {value.length > 50 ? value.slice(0, 50) + "..." : value}
      </span>
    );
  }
  return (
    <span className="text-sm text-muted-foreground">
      {JSON.stringify(value).slice(0, 50)}
    </span>
  );
}

function DataCard({
  record,
  index,
}: {
  record: Record<string, unknown>;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(record);
  const summaryFields = entries.slice(0, 3);
  const remainingFields = entries.slice(3);

  return (
    <div className="border rounded-lg bg-card hover:shadow-md transition-shadow">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            #{index + 1}
          </Badge>
          {remainingFields.length > 0 && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Collapse" : `+${remainingFields.length} more`}
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {summaryFields.map(([key, value]) => (
            <div key={key}>
              <p className="text-xs text-muted-foreground">{key}</p>
              <FieldPreview value={value} />
            </div>
          ))}
        </div>

        {expanded && remainingFields.length > 0 && (
          <div className="mt-3 pt-3 border-t space-y-1.5">
            {remainingFields.map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="text-sm break-all">
                  {value == null
                    ? "null"
                    : typeof value === "string"
                    ? value
                    : JSON.stringify(value)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DataCardGrid({ data }: DataCardGridProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No data records
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {data.map((record, i) => (
          <DataCard key={i} record={record} index={i} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        {data.length} records total
      </p>
    </div>
  );
}
