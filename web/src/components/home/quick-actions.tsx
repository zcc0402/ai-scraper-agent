import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Puzzle, Settings, ArrowRight } from "lucide-react";

const actions = [
  {
    label: "创建任务",
    description: "用自然语言描述你想抓取的数据",
    href: "/tasks/create",
    icon: PlusCircle,
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
  },
  {
    label: "浏览 Skills",
    description: "发现和安装爬虫技能",
    href: "/skills",
    icon: Puzzle,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-100",
  },
  {
    label: "系统设置",
    description: "配置 LLM 和系统参数",
    href: "/settings",
    icon: Settings,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className={`border ${action.borderColor} shadow-sm hover:shadow-md transition-all cursor-pointer h-full group`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{action.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
