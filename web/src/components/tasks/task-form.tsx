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
      <div>
        <Label htmlFor="userInput">描述你想抓取的数据</Label>
        <Textarea
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="例如：抓取 Hacker News 前10条标题"
          rows={4}
          className="mt-2"
        />
        <div className="flex gap-2 mt-2">
          {examples.map((ex) => (
            <Button
              key={ex}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUserInput(ex)}
            >
              {ex.slice(0, 20)}...
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>输出格式</Label>
        <Select value={outputFormat} onValueChange={setOutputFormat}>
          <SelectTrigger className="mt-2 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading || !userInput.trim()}>
        {loading ? "创建中..." : "开始爬取"}
      </Button>
    </form>
  );
}
