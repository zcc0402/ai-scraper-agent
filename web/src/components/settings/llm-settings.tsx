"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Brain, Key, Cpu } from "lucide-react";

interface LLMSettingsProps {
  settings: Record<string, any>;
  onUpdate: (key: string, value: string) => void;
}

export function LLMSettings({ settings, onUpdate }: LLMSettingsProps) {
  const [testing, setTesting] = useState(false);

  async function testConnection() {
    setTesting(true);
    setTimeout(() => setTesting(false), 1500);
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Brain className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle>LLM 配置</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              配置大语言模型提供商和参数
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            Provider
          </Label>
          <Input
            value={settings.llm_provider || ""}
            onChange={(e) => onUpdate("llm_provider", e.target.value)}
            placeholder="google"
          />
          <p className="text-xs text-muted-foreground">
            支持的提供商：google, openai, anthropic, deepseek 等
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-muted-foreground" />
            Model
          </Label>
          <Input
            value={settings.llm_model || ""}
            onChange={(e) => onUpdate("llm_model", e.target.value)}
            placeholder="gemini-2.5-flash"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            API Key
          </Label>
          <Input
            type="password"
            value={settings.llm_api_key || ""}
            onChange={(e) => onUpdate("llm_api_key", e.target.value)}
            placeholder="sk-..."
          />
        </div>

        <Button variant="outline" onClick={testConnection} disabled={testing}>
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              测试中...
            </>
          ) : (
            "测试连接"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
