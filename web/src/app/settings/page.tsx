"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Save } from "lucide-react";
import { LLMSettings } from "@/components/settings/llm-settings";
import { DisplaySettings } from "@/components/settings/display-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { DataSettings } from "@/components/settings/data-settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  function updateSetting(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          系统设置
        </h1>
        <p className="text-muted-foreground mt-1">
          配置 AI Scraper 的各项参数
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <LLMSettings settings={settings} onUpdate={updateSetting} />
        <DisplaySettings settings={settings} onUpdate={updateSetting} />
        <NotificationSettings settings={settings} onUpdate={updateSetting} />
        <DataSettings />
      </div>

      {/* Save Button */}
      <div className="sticky bottom-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 shadow-lg"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              保存设置
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
