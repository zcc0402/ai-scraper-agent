"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Database, Download, Trash2, HardDrive } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DataSettings() {
  const [retentionDays, setRetentionDays] = useState("30");
  const [showClearDialog, setShowClearDialog] = useState(false);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Database className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <CardTitle>数据管理</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              管理任务数据和存储
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            数据保留天数
          </Label>
          <Input
            type="number"
            value={retentionDays}
            onChange={(e) => setRetentionDays(e.target.value)}
            min="1"
            max="365"
          />
          <p className="text-xs text-muted-foreground">
            超过此天数的任务数据将自动清理
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            导出数据
          </Button>

          <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <DialogTrigger render={<Button variant="destructive" className="gap-2" />}>
              <Trash2 className="h-4 w-4" />
              清除数据
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认清除数据</DialogTitle>
                <DialogDescription>
                  此操作将删除所有已完成的任务数据。此操作不可撤销。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowClearDialog(false)}
                >
                  取消
                </Button>
                <Button variant="destructive">确认清除</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
