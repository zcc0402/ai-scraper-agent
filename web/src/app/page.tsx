import { QuickStats } from "@/components/home/quick-stats";
import { RecentTasks } from "@/components/home/recent-tasks";
import { QuickActions } from "@/components/home/quick-actions";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            欢迎使用 AI Scraper
          </h1>
          <p className="text-muted-foreground max-w-lg mb-6">
            用自然语言描述你想抓取的数据，AI 自动完成爬取。支持多角色协作、实时进度推送、多格式导出。
          </p>
          <Link href="/tasks/create">
            <Button className="gap-2">
              创建任务
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-20 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">数据概览</h2>
        <QuickStats />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">快速开始</h2>
        <QuickActions />
      </div>

      {/* Recent Tasks */}
      <div>
        <RecentTasks />
      </div>
    </div>
  );
}
