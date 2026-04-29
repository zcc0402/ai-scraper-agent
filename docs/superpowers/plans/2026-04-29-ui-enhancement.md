# UI Enhancement & Feature Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the AI Scraper web application with improved styling, functional Skills marketplace, expanded Settings, dynamic Homepage, and authentication foundation.

**Architecture:** Incremental UI improvements using existing shadcn/ui components and Tailwind CSS. Add new pages for user profile and authentication. Enhance existing pages with dynamic data fetching and better visual hierarchy.

**Tech Stack:** Next.js 15 (App Router), React 19, shadcn/ui, Tailwind CSS v4, Drizzle ORM, Zustand

---

## File Structure

### New Files
- `src/app/skills/[skillId]/page.tsx` — Skill detail page
- `src/components/skills/skill-detail.tsx` — Skill detail component
- `src/app/profile/page.tsx` — User profile page (placeholder for auth)
- `src/components/settings/llm-settings.tsx` — Extracted LLM settings component
- `src/components/settings/display-settings.tsx` — Display/theme settings
- `src/components/settings/notification-settings.tsx` — Notification preferences
- `src/components/settings/data-settings.tsx` — Data management settings
- `src/components/home/recent-tasks.tsx` — Recent tasks widget
- `src/components/home/quick-stats.tsx` — Dynamic stats widget
- `src/components/home/quick-actions.tsx` — Quick action buttons
- `src/app/api/skills/[skillId]/route.ts` — Skill detail API
- `src/app/api/stats/route.ts` — Stats API for homepage

### Modified Files
- `src/app/tasks/create/page.tsx` — Fix styling issues
- `src/components/tasks/task-form.tsx` — Optimize form styling
- `src/app/page.tsx` — Transform to dynamic dashboard
- `src/app/skills/page.tsx` — Enhance marketplace UI
- `src/app/settings/page.tsx` — Expand settings sections
- `src/components/layout/sidebar.tsx` — Add profile link
- `src/components/layout/app-layout.tsx` — Add user avatar/menu

---

## Task 1: Fix Task Creation Page Styling

**Files:**
- Modify: `src/app/tasks/create/page.tsx`
- Modify: `src/components/tasks/task-form.tsx`

- [ ] **Step 1: Improve hero section spacing and visual hierarchy**

Update `src/app/tasks/create/page.tsx` to add better spacing and a subtle background:

```tsx
import { TaskForm } from "@/components/tasks/task-form";
import { Sparkles } from "lucide-react";

export default function CreateTaskPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Section */}
      <div className="mb-10 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl" />
        <div className="flex items-center gap-4 mb-3 pt-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">创建任务</h1>
            <p className="text-base text-muted-foreground mt-1">
              用自然语言描述你想抓取的数据，AI 智能完成
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <TaskForm />
    </div>
  );
}
```

- [ ] **Step 2: Optimize form section styling in TaskForm**

Update `src/components/tasks/task-form.tsx` to improve section cards and spacing:

```tsx
// In the form return statement, wrap each section in a subtle card
// Update the form container to add card styling
return (
  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Section 1: Task Description - wrapped in card */}
    <Card className="border-0 shadow-sm bg-muted/30">
      <CardContent className="p-6 space-y-4">
        {/* ... existing section 1 content ... */}
      </CardContent>
    </Card>

    {/* Section 2: Target URL - wrapped in card */}
    <Card className="border-0 shadow-sm bg-muted/30">
      <CardContent className="p-6 space-y-3">
        {/* ... existing section 2 content ... */}
      </CardContent>
    </Card>

    {/* ... repeat for other sections ... */}
  </form>
);
```

- [ ] **Step 3: Add hover effects and transitions to interactive elements**

Update badge examples and skill cards with better hover states:

```tsx
// Update example badges with better hover effects
<Badge
  key={ex.text}
  variant="outline"
  className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 py-2 px-4 text-xs font-normal group"
  onClick={() => applyExample(ex.text, ex.url)}
>
  <span className="group-hover:translate-x-0.5 transition-transform">
    {ex.text.length > 28 ? ex.text.slice(0, 28) + "..." : ex.text}
  </span>
</Badge>
```

- [ ] **Step 4: Enhance submit button with gradient and animation**

```tsx
{/* Submit Button with gradient */}
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
```

- [ ] **Step 5: Commit styling improvements**

```bash
git add src/app/tasks/create/page.tsx src/components/tasks/task-form.tsx
git commit -m "fix: improve task creation page styling and visual hierarchy"
```

---

## Task 2: Transform Homepage to Dynamic Dashboard

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/home/recent-tasks.tsx`
- Create: `src/components/home/quick-stats.tsx`
- Create: `src/components/home/quick-actions.tsx`
- Create: `src/app/api/stats/route.ts`

- [ ] **Step 1: Create Stats API endpoint**

Create `src/app/api/stats/route.ts` to provide dynamic statistics:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET() {
  try {
    const totalTasks = await db.select({ count: count() }).from(tasks);
    const completedTasks = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.status, "completed"));
    const runningTasks = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.status, "running"));

    return NextResponse.json({
      totalTasks: totalTasks[0]?.count || 0,
      completedTasks: completedTasks[0]?.count || 0,
      runningTasks: runningTasks[0]?.count || 0,
      successRate: totalTasks[0]?.count
        ? Math.round((completedTasks[0]?.count / totalTasks[0]?.count) * 100)
        : 0,
    });
  } catch (error) {
    return NextResponse.json({
      totalTasks: 0,
      completedTasks: 0,
      runningTasks: 0,
      successRate: 0,
    });
  }
}
```

- [ ] **Step 2: Create QuickStats component**

Create `src/components/home/quick-stats.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface Stats {
  totalTasks: number;
  completedTasks: number;
  runningTasks: number;
  successRate: number;
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const statItems = [
    {
      label: "总任务数",
      value: stats?.totalTasks ?? "-",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "已完成",
      value: stats?.completedTasks ?? "-",
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "运行中",
      value: stats?.runningTasks ?? "-",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "成功率",
      value: stats ? `${stats.successRate}%` : "-",
      icon: TrendingUp,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create RecentTasks component**

Create `src/components/home/recent-tasks.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Task {
  id: string;
  userInput: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  running: "bg-blue-500/10 text-blue-500",
  completed: "bg-emerald-500/10 text-emerald-500",
  failed: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "等待中",
  running: "运行中",
  completed: "已完成",
  failed: "失败",
};

export function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch("/api/tasks?limit=5")
      .then((r) => r.json())
      .then(setTasks)
      .catch(() => {});
  }, []);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">最近任务</CardTitle>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-1">
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            暂无任务，创建你的第一个爬虫任务吧
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {task.userInput}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(task.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={statusColors[task.status] || ""}
                >
                  {statusLabels[task.status] || task.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create QuickActions component**

Create `src/components/home/quick-actions.tsx`:

```tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Puzzle, Settings, Zap } from "lucide-react";

const actions = [
  {
    label: "创建任务",
    description: "用自然语言描述你想抓取的数据",
    href: "/tasks/create",
    icon: PlusCircle,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "浏览 Skills",
    description: "发现和安装爬虫技能",
    href: "/skills",
    icon: Puzzle,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "系统设置",
    description: "配置 LLM 和系统参数",
    href: "/settings",
    icon: Settings,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${action.bgColor}`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{action.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Transform homepage to dynamic dashboard**

Update `src/app/page.tsx`:

```tsx
import { QuickStats } from "@/components/home/quick-stats";
import { RecentTasks } from "@/components/home/recent-tasks";
import { QuickActions } from "@/components/home/quick-actions";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            欢迎使用 AI Scraper
          </h1>
          <p className="text-muted-foreground mt-1">
            用自然语言描述你想抓取的数据，AI 自动完成爬取
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">快速开始</h2>
        <QuickActions />
      </div>

      {/* Recent Tasks */}
      <RecentTasks />
    </div>
  );
}
```

- [ ] **Step 6: Commit homepage transformation**

```bash
git add src/app/page.tsx src/components/home/ src/app/api/stats/
git commit -m "feat: transform homepage to dynamic dashboard with stats and recent tasks"
```

---

## Task 3: Enhance Skills Marketplace

**Files:**
- Modify: `src/app/skills/page.tsx`
- Create: `src/app/skills/[skillId]/page.tsx`
- Create: `src/components/skills/skill-detail.tsx`
- Create: `src/app/api/skills/[skillId]/route.ts`

- [ ] **Step 1: Enhance Skills page with search and categories**

Update `src/app/skills/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { SkillCard } from "@/components/skills/skill-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Puzzle, Filter } from "lucide-react";

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => {
        setSkills(data);
        setLoading(false);
      });
  }, []);

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      !search ||
      skill.displayName.toLowerCase().includes(search.toLowerCase()) ||
      skill.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || skill.type === selectedType;
    return matchesSearch && matchesType;
  });

  const skillTypes = Array.from(new Set(skills.map((s) => s.type)));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Puzzle className="h-6 w-6 text-primary" />
          Skill 市场
        </h1>
        <p className="text-muted-foreground mt-1">
          发现和安装爬虫技能，扩展 AI Scraper 的能力
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索技能..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant={selectedType === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedType(null)}
          >
            全部
          </Badge>
          {skillTypes.map((type) => (
            <Badge
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedType(type === selectedType ? null : type)}
            >
              {type === "native" ? "内置" : type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="text-center py-12">
          <Puzzle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {search ? "没有找到匹配的技能" : "暂无可用技能"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Skill Detail API**

Create `src/app/api/skills/[skillId]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { skillRegistry } from "@/lib/skills/registry";

export async function GET(
  request: Request,
  { params }: { params: { skillId: string } }
) {
  const skill = skillRegistry.get(params.skillId);

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: skill.name,
    displayName: skill.displayName,
    description: skill.description,
    version: skill.version,
    type: skill.type,
    // Add more skill details as needed
  });
}
```

- [ ] **Step 3: Create Skill Detail Component**

Create `src/components/skills/skill-detail.tsx`:

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Puzzle,
  ArrowLeft,
  Zap,
  Clock,
  Tag,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface SkillDetailProps {
  skill: {
    name: string;
    displayName: string;
    description: string;
    version: string;
    type: string;
  };
}

export function SkillDetail({ skill }: SkillDetailProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/skills">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回技能市场
        </Button>
      </Link>

      {/* Skill Header */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Puzzle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{skill.displayName}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {skill.type === "native" ? "内置" : skill.type}
                  </Badge>
                  <Badge variant="outline">v{skill.version}</Badge>
                </div>
              </div>
            </div>
            <Button className="gap-2">
              <Zap className="h-4 w-4" />
              使用此技能
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {skill.description}
          </p>
        </CardContent>
      </Card>

      {/* Skill Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">技能信息</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">名称</span>
                <span className="text-sm font-medium">{skill.name}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">版本</span>
                <span className="text-sm font-medium">{skill.version}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">类型</span>
                <span className="text-sm font-medium">
                  {skill.type === "native" ? "内置技能" : skill.type}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold">功能特性</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                自然语言任务描述
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                智能数据提取
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                多格式输出支持
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Usage Example */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">使用示例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground"># 示例任务描述</p>
            <p className="mt-2">抓取 Hacker News 前10条标题和链接</p>
            <p className="mt-1">返回字段：title, url, score</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Create Skill Detail Page**

Create `src/app/skills/[skillId]/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SkillDetail } from "@/components/skills/skill-detail";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkillDetailPage() {
  const params = useParams();
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/skills/${params.skillId}`)
      .then((r) => r.json())
      .then((data) => {
        setSkill(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.skillId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">技能未找到</p>
      </div>
    );
  }

  return <SkillDetail skill={skill} />;
}
```

- [ ] **Step 5: Update SkillCard to link to detail page**

Update `src/components/skills/skill-card.tsx` to add navigation:

```tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Puzzle, ArrowRight } from "lucide-react";

interface SkillCardProps {
  skill: {
    name: string;
    displayName: string;
    description: string;
    version: string;
    type: string;
  };
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link href={`/skills/${skill.name}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Puzzle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{skill.displayName}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {skill.type === "native" ? "内置" : skill.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    v{skill.version}
                  </span>
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {skill.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 6: Commit skills marketplace enhancement**

```bash
git add src/app/skills/ src/components/skills/ src/app/api/skills/
git commit -m "feat: enhance skills marketplace with search, filters, and detail page"
```

---

## Task 4: Expand Settings Page

**Files:**
- Modify: `src/app/settings/page.tsx`
- Create: `src/components/settings/llm-settings.tsx`
- Create: `src/components/settings/display-settings.tsx`
- Create: `src/components/settings/notification-settings.tsx`
- Create: `src/components/settings/data-settings.tsx`

- [ ] **Step 1: Create LLM Settings component**

Create `src/components/settings/llm-settings.tsx`:

```tsx
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
    // TODO: Implement API test
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
```

- [ ] **Step 2: Create Display Settings component**

Create `src/components/settings/display-settings.tsx`:

```tsx
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
```

- [ ] **Step 3: Create Notification Settings component**

Create `src/components/settings/notification-settings.tsx`:

```tsx
"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare } from "lucide-react";

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
```

- [ ] **Step 4: Create Data Settings component**

Create `src/components/settings/data-settings.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Database, Download, Trash2, HardDrive } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DataSettings() {
  const [retentionDays, setRetentionDays] = useState("30");
  const [showClearDialog, setShowClearDialog] = useState(false);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Database className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <CardTitle>数据管理</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              管理任务数据和存储
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            数据保留天数
          </Label>
          <Input
            type="number"
            value={retentionDays}
            onChange={(e) => setRetentionDays(e.target.value)}
            min="1"
            max="365"
          />
          <p className="text-xs text-muted-foreground">
            超过此天数的任务数据将自动清理
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            导出数据
          </Button>

          <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                清除数据
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认清除数据</DialogTitle>
                <DialogDescription>
                  此操作将删除所有已完成的任务数据。此操作不可撤销。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowClearDialog(false)}
                >
                  取消
                </Button>
                <Button variant="destructive">确认清除</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Update Settings page with all sections**

Update `src/app/settings/page.tsx`:

```tsx
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
```

- [ ] **Step 6: Commit settings expansion**

```bash
git add src/app/settings/ src/components/settings/
git commit -m "feat: expand settings page with LLM, display, notification, and data management"
```

---

## Task 5: Add Authentication Foundation & User Profile

**Files:**
- Create: `src/app/profile/page.tsx`
- Create: `src/components/layout/user-nav.tsx`
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/layout/app-layout.tsx`

- [ ] **Step 1: Create User Navigation component**

Create `src/components/layout/user-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

export function UserNav() {
  // Placeholder - will be replaced with actual auth
  const user = {
    name: "用户",
    email: "user@example.com",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 h-10 px-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline">
            {user.name}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="gap-2">
            <User className="h-4 w-4" />
            个人中心
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="gap-2">
            <Settings className="h-4 w-4" />
            系统设置
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Update Sidebar with user nav**

Update `src/components/layout/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ListTodo,
  PlusCircle,
  Puzzle,
  Settings,
  Bot,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";

const navItems = [
  { title: "首页", url: "/", icon: Home },
  { title: "任务列表", url: "/tasks", icon: ListTodo },
  { title: "创建任务", url: "/tasks/create", icon: PlusCircle },
  { title: "Skills", url: "/skills", icon: Puzzle },
  { title: "设置", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Bot className="h-6 w-6" />
          <span className="font-semibold text-lg">AI Scraper</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/" && pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2">
          <UserNav />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
```

- [ ] **Step 3: Create Profile Page**

Create `src/app/profile/page.tsx`:

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Shield,
  Key,
  Activity,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function ProfilePage() {
  // Placeholder user data
  const user = {
    name: "用户",
    email: "user@example.com",
    role: "管理员",
    createdAt: "2026-01-01",
    tasksCreated: 42,
    tasksCompleted: 38,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          个人中心
        </h1>
        <p className="text-muted-foreground mt-1">
          管理你的账户信息和偏好设置
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{user.role}</Badge>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{user.tasksCreated}</p>
                <p className="text-xs text-muted-foreground">已创建任务</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{user.tasksCompleted}</p>
                <p className="text-xs text-muted-foreground">已完成任务</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-violet-500" />
              <div>
                <p className="text-sm font-medium">{user.createdAt}</p>
                <p className="text-xs text-muted-foreground">注册时间</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            账户设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              用户名
            </Label>
            <Input defaultValue={user.name} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              邮箱
            </Label>
            <Input defaultValue={user.email} type="email" />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              修改密码
            </Label>
            <Input type="password" placeholder="当前密码" />
            <Input type="password" placeholder="新密码" />
            <Input type="password" placeholder="确认新密码" />
          </div>

          <Button className="gap-2">
            <Shield className="h-4 w-4" />
            保存更改
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-sm border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">危险操作</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            以下操作不可撤销，请谨慎操作。
          </p>
          <Button variant="destructive" className="gap-2">
            删除账户
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Update AppLayout to show user nav in header**

Update `src/components/layout/app-layout.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./sidebar";
import { UserNav } from "./user-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspace = /^\/tasks\/[^/]+$/.test(pathname);

  if (isWorkspace) {
    return (
      <TooltipProvider>
        <div className="h-screen w-screen overflow-hidden">
          {children}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <UserNav />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
```

- [ ] **Step 5: Commit authentication foundation**

```bash
git add src/app/profile/ src/components/layout/user-nav.tsx src/components/layout/sidebar.tsx src/components/layout/app-layout.tsx
git commit -m "feat: add authentication foundation with user profile and navigation"
```

---

## Task 6: Install Missing Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install date-fns for date formatting**

```bash
cd /Users/yuwang/code/ai/web && npm install date-fns
```

- [ ] **Step 2: Commit dependency addition**

```bash
git add package.json package-lock.json
git commit -m "chore: add date-fns dependency for date formatting"
```

---

## Execution Order

Execute tasks in this order:
1. **Task 6** - Install dependencies first
2. **Task 1** - Fix task creation styling (quick win)
3. **Task 2** - Transform homepage (high impact)
4. **Task 3** - Enhance skills marketplace
5. **Task 4** - Expand settings page
6. **Task 5** - Add auth foundation (optional, for future)

Each task is self-contained and can be committed independently. The order ensures dependencies are met and builds incrementally from quick fixes to new features.
