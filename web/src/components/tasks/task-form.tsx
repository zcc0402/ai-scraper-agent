"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Globe,
  FileText,
  Settings2,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  Bot,
  Database,
  Link2,
} from "lucide-react";

interface Skill {
  name: string;
  displayName: string;
  description: string;
  version: string;
  type: string;
}

const exampleCategories = [
  {
    label: "热门网站",
    icon: Globe,
    examples: [
      { text: "抓取 Hacker News 前10条标题和链接", url: "https://news.ycombinator.com" },
      { text: "抓取 GitHub Trending 今日热门项目名称和描述", url: "https://github.com/trending" },
      { text: "抓取掘金首页热门文章标题和作者", url: "https://juejin.cn" },
    ],
  },
  {
    label: "电商数据",
    icon: Database,
    examples: [
      { text: "提取京东搜索 '无线耳机' 前20个商品名称、价格和评分", url: "" },
      { text: "抓取淘宝搜索 '机械键盘' 前20个商品名称和价格", url: "" },
      { text: "提取拼多多 '手机壳' 商品列表，包含名称、价格、销量", url: "" },
    ],
  },
  {
    label: "新闻资讯",
    icon: FileText,
    examples: [
      { text: "抓取新浪新闻首页头条标题和摘要", url: "https://news.sina.com.cn" },
      { text: "抓取36氪首页最新文章标题、作者和发布时间", url: "https://36kr.com" },
      { text: "抓取知乎热榜前10个问题标题和热度", url: "https://www.zhihu.com/hot" },
    ],
  },
];

const timeoutOptions = [
  { value: "120", label: "2 分钟" },
  { value: "300", label: "5 分钟（默认）" },
  { value: "600", label: "10 分钟" },
  { value: "1200", label: "20 分钟" },
  { value: "1800", label: "30 分钟" },
  { value: "3600", label: "60 分钟" },
];

export function TaskForm() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [outputFormat, setOutputFormat] = useState("json");
  const [skillName, setSkillName] = useState("");
  const [timeout, setTimeout_] = useState("300");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedExampleCategory, setSelectedExampleCategory] = useState(0);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => setSkills(data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          targetUrl: targetUrl || undefined,
          outputFormat,
          skillName: skillName || undefined,
          timeout: parseInt(timeout),
        }),
      });
      const task = await res.json();
      router.push(`/tasks/${task.id}`);
    } finally {
      setLoading(false);
    }
  }

  function applyExample(text: string, url: string) {
    setUserInput(text);
    if (url) setTargetUrl(url);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Task Description */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <Label htmlFor="userInput" className="text-base font-semibold">
              描述你的任务
            </Label>
          </div>

          <Textarea
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="用自然语言描述你想抓取的数据，例如：抓取 Hacker News 前10条标题和链接，返回标题、链接、评分三个字段"
            rows={5}
            className="resize-none text-base leading-relaxed bg-background"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>尽量详细描述目标数据的字段和数量，AI 会更精准地提取</span>
            <span>{userInput.length} / 2000</span>
          </div>

          {/* Example prompts */}
          <div className="space-y-3">
            <div className="flex gap-1">
              {exampleCategories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.label}
                    type="button"
                    variant={selectedExampleCategory === idx ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setSelectedExampleCategory(idx)}
                  >
                    <Icon className="h-3 w-3" />
                    {cat.label}
                  </Button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {exampleCategories[selectedExampleCategory].examples.map((ex) => (
                <Badge
                  key={ex.text}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 py-1.5 px-3 text-xs font-normal group"
                  onClick={() => applyExample(ex.text, ex.url)}
                >
                  <span className="group-hover:translate-x-0.5 transition-transform inline-block">
                    {ex.text.length > 28 ? ex.text.slice(0, 28) + "..." : ex.text}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Target URL */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10">
              <Link2 className="h-4 w-4 text-blue-500" />
            </div>
            <Label htmlFor="targetUrl" className="text-base font-semibold">
              目标网址
              <span className="text-xs font-normal text-muted-foreground ml-2">可选</span>
            </Label>
          </div>
          <Input
            id="targetUrl"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com（不填则由 AI 自动推断）"
            type="url"
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            指定起始网址可以让任务更快开始，避免 AI 额外搜索
          </p>
        </CardContent>
      </Card>

      {/* Section 3: Skill Selection */}
      {skills.length > 0 && (
        <Card className="border-0 shadow-sm bg-muted/30">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/10">
                <Bot className="h-4 w-4 text-violet-500" />
              </div>
              <Label className="text-base font-semibold">
                选择技能
                <span className="text-xs font-normal text-muted-foreground ml-2">可选</span>
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !skillName ? "ring-2 ring-primary" : "hover:border-primary/50"
                }`}
                onClick={() => setSkillName("")}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">自动匹配</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        AI 根据任务自动选择最佳技能
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {skills.map((skill) => (
                <Card
                  key={skill.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    skillName === skill.name
                      ? "ring-2 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSkillName(skill.name)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <Bot className="h-4 w-4 mt-0.5 text-violet-500" />
                      <div>
                        <p className="text-sm font-medium">{skill.displayName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {skill.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Output Settings */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10">
              <FileText className="h-4 w-4 text-emerald-500" />
            </div>
            <Label className="text-base font-semibold">输出设置</Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">输出格式</Label>
              <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v || "json")}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON（结构化数据）</SelectItem>
                  <SelectItem value="csv">CSV（表格数据）</SelectItem>
                  <SelectItem value="excel">Excel（电子表格）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">超时时间</Label>
              <Select value={timeout} onValueChange={(v) => v && setTimeout_(v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeoutOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Advanced Options (collapsible) */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-6 space-y-3">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings2 className="h-4 w-4" />
            <span>高级选项</span>
            <span className="ml-auto">
              {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </span>
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">自动重试</Label>
                  <p className="text-xs text-muted-foreground">失败后自动重试一次</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">保存截图</Label>
                  <p className="text-xs text-muted-foreground">记录抓取过程中的页面截图</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">实时推送</Label>
                  <p className="text-xs text-muted-foreground">通过 SSE 实时推送执行进度</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !userInput.trim()}
        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all duration-300"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            创建任务中...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            开始执行
          </span>
        )}
      </Button>
    </form>
  );
}
