"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Globe, Monitor } from "lucide-react";

interface DisplaySettingsProps {
  settings: Record<string, any>;
  onUpdate: (key: string, value: string) => void;
}

export function DisplaySettings({ settings, onUpdate }: DisplaySettingsProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Palette className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <CardTitle>显示设置</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              自定义界面外观和语言
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              深色模式
            </Label>
            <p className="text-xs text-muted-foreground">
              切换深色/浅色主题
            </p>
          </div>
          <Switch
            checked={settings.theme === "dark"}
            onCheckedChange={(checked) =>
              onUpdate("theme", checked ? "dark" : "light")
            }
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            语言
          </Label>
          <Select
            value={settings.language || "zh"}
            onValueChange={(v) => onUpdate("language", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
