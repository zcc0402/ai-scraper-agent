"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const examples = [
  "抓取 Hacker News 前10条标题",
  "提取淘宝搜索 '机械键盘' 前20个商品名称和价格",
  "抓取 GitHub Trending 今日热门项目",
];

export function TaskForm() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [outputFormat, setOutputFormat] = useState("json");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput, outputFormat }),
      });
      const task = await res.json();
      router.push(`/tasks/${task.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="userInput">描述你想抓取的数据</Label>
        <Textarea
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="例如：抓取 Hacker News 前10条标题"
          rows={4}
        />
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <Badge
              key={ex}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => setUserInput(ex)}
            >
              {ex.slice(0, 20)}...
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>输出格式</Label>
        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v || "json")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading || !userInput.trim()} className="w-full" size="lg">
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            创建中...
          </span>
        ) : (
          "开始爬取"
        )}
      </Button>
    </form>
  );
}
