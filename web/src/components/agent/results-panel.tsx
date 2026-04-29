"use client";

import { Database, Download, Table, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelHeader } from "./panel-header";
import { DataCardGrid } from "./data-card-grid";
import { ResultsTable } from "@/components/tasks/results-table";

interface ResultsPanelProps {
  taskId: string;
  resultData: unknown;
  outputFormat?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  maximized?: boolean;
  onToggleMaximize?: () => void;
}

export function ResultsPanel({
  taskId,
  resultData,
  outputFormat,
  collapsed,
  onToggleCollapse,
  maximized,
  onToggleMaximize,
}: ResultsPanelProps) {
  const isArray = Array.isArray(resultData);
  const hasData = resultData != null;

  if (collapsed) {
    return (
      <div className="w-12 border-l bg-muted/20 flex flex-col items-center py-2 gap-2">
        <Database className="h-5 w-5 text-muted-foreground" />
        <div
          className="text-xs text-muted-foreground"
          style={{ writingMode: "vertical-rl" }}
        >
          Results
        </div>
      </div>
    );
  }

  return (
    <div className="w-[360px] border-l flex flex-col min-h-0">
      <PanelHeader
        title="Results"
        icon={<Database className="h-4 w-4 text-muted-foreground" />}
        maximized={maximized}
        onToggleMaximize={onToggleMaximize}
        onToggleCollapse={onToggleCollapse}
        actions={
          hasData ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              nativeButton={false}
              render={<a href={`/api/tasks/${taskId}/download`} />}
            >
              <Download className="h-3 w-3 mr-1" />
              {outputFormat?.toUpperCase() || "Download"}
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-auto p-3">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Database className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">No results yet</p>
            <p className="text-xs mt-1">
              Results will appear when the agent completes
            </p>
          </div>
        ) : (
          <Tabs defaultValue={isArray ? "cards" : "json"} className="w-full">
            <TabsList className="w-full mb-3">
              {isArray && (
                <TabsTrigger value="cards" className="flex-1 text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  Cards
                </TabsTrigger>
              )}
              {isArray && (
                <TabsTrigger value="table" className="flex-1 text-xs">
                  <Table className="h-3 w-3 mr-1" />
                  Table
                </TabsTrigger>
              )}
              <TabsTrigger value="json" className="flex-1 text-xs">
                <Code className="h-3 w-3 mr-1" />
                JSON
              </TabsTrigger>
            </TabsList>

            {isArray && (
              <TabsContent value="cards">
                <DataCardGrid data={resultData as Record<string, unknown>[]} />
              </TabsContent>
            )}
            {isArray && (
              <TabsContent value="table">
                <ResultsTable data={resultData as Record<string, unknown>[]} />
              </TabsContent>
            )}
            <TabsContent value="json">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 text-xs z-10"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      JSON.stringify(resultData, null, 2)
                    )
                  }
                >
                  Copy
                </Button>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[600px] text-xs">
                  {JSON.stringify(resultData, null, 2)}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
