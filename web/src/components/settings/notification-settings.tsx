"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, MessageSquare } from "lucide-react";

interface NotificationSettingsProps {
  settings: Record<string, any>;
  onUpdate: (key: string, value: string) => void;
}

export function NotificationSettings({
  settings,
  onUpdate,
}: NotificationSettingsProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Bell className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <CardTitle>通知设置</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              配置任务完成和系统通知
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              浏览器通知
            </Label>
            <p className="text-xs text-muted-foreground">
              任务完成时发送浏览器通知
            </p>
          </div>
          <Switch
            checked={settings.browser_notifications === "true"}
            onCheckedChange={(checked) =>
              onUpdate("browser_notifications", String(checked))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              任务失败通知
            </Label>
            <p className="text-xs text-muted-foreground">
              任务失败时发送通知
            </p>
          </div>
          <Switch
            checked={settings.failure_notifications === "true"}
            onCheckedChange={(checked) =>
              onUpdate("failure_notifications", String(checked))
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
