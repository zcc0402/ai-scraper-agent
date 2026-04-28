"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">设置</h1>

      <Card>
        <CardHeader>
          <CardTitle>LLM 配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Provider</Label>
            <Input
              value={settings.llm_provider || ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, llm_provider: e.target.value }))
              }
              placeholder="google"
            />
          </div>
          <div>
            <Label>Model</Label>
            <Input
              value={settings.llm_model || ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, llm_model: e.target.value }))
              }
              placeholder="gemini-2.5-flash"
            />
          </div>
          <div>
            <Label>API Key</Label>
            <Input
              type="password"
              value={settings.llm_api_key || ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, llm_api_key: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "保存中..." : "保存设置"}
      </Button>
    </div>
  );
}
