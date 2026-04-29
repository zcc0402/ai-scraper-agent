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
