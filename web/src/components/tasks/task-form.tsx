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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="userInput" className="text-[#94A3B8] text-sm font-medium">
          描述你想抓取的数据
        </Label>
        <Textarea
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="例如：抓取 Hacker News 前10条标题"
          rows={4}
          className="bg-[#1E293B] border-[#475569] text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#22C55E] focus:ring-[#22C55E]/20 rounded-lg"
        />
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setUserInput(ex)}
              className="px-4 py-2 bg-[#1E293B] border border-[#475569] rounded-lg text-sm text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#22C55E]/50 transition-all duration-200"
            >
              {ex.slice(0, 20)}...
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-[#94A3B8] text-sm font-medium">输出格式</Label>
        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v || "json")}>
          <SelectTrigger className="w-48 bg-[#1E293B] border-[#475569] text-[#F8FAFC] rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-[#475569]">
            <SelectItem value="json" className="text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#22C55E]/10">
              JSON
            </SelectItem>
            <SelectItem value="csv" className="text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#22C55E]/10">
              CSV
            </SelectItem>
            <SelectItem value="excel" className="text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#22C55E]/10">
              Excel
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={loading || !userInput.trim()}
        className="w-full py-6 text-lg font-semibold bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] rounded-lg shadow-lg shadow-[#22C55E]/25 hover:shadow-[#22C55E]/50 transition-all duration-200"
      >
        {loading ? (
          <span className="flex items-center gap-3">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            创建中...
          </span>
        ) : (
          "开始爬取"
        )}
      </Button>
    </form>
  );
}
