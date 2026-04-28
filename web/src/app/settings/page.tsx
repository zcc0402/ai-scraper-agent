"use client";

import { useState, useEffect } from "react";
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
    <div className="min-h-screen bg-[#0F172A] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#F8FAFC] mb-8">设置</h1>

        <div className="bg-[#1E293B] border border-[#475569] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-6">LLM 配置</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-[#94A3B8] text-sm mb-2 block">Provider</Label>
              <Input
                value={settings.llm_provider || ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, llm_provider: e.target.value }))
                }
                placeholder="google"
                className="bg-[#0F172A] border-[#475569] text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
              />
            </div>
            <div>
              <Label className="text-[#94A3B8] text-sm mb-2 block">Model</Label>
              <Input
                value={settings.llm_model || ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, llm_model: e.target.value }))
                }
                placeholder="gemini-2.5-flash"
                className="bg-[#0F172A] border-[#475569] text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
              />
            </div>
            <div>
              <Label className="text-[#94A3B8] text-sm mb-2 block">API Key</Label>
              <Input
                type="password"
                value={settings.llm_api_key || ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, llm_api_key: e.target.value }))
                }
                className="bg-[#0F172A] border-[#475569] text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] font-semibold"
        >
          {saving ? "保存中..." : "保存设置"}
        </Button>
      </div>
    </div>
  );
}
