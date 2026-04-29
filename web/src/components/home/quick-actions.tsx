import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Puzzle, Settings } from "lucide-react";

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
