import Link from "next/link";
import { PlusCircle, Puzzle, Settings, ArrowRight } from "lucide-react";

const actions = [
  {
    label: "创建任务",
    description: "用自然语言描述你想抓取的数据",
    href: "/tasks/create",
    icon: PlusCircle,
    gradient: "from-primary/10 to-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    borderHover: "hover:border-primary/30",
  },
  {
    label: "浏览 Skills",
    description: "发现和安装爬虫技能",
    href: "/skills",
    icon: Puzzle,
    gradient: "from-violet-500/10 to-violet-500/5",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    borderHover: "hover:border-violet-300",
  },
  {
    label: "系统设置",
    description: "配置 LLM 和系统参数",
    href: "/settings",
    icon: Settings,
    gradient: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderHover: "hover:border-emerald-300",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${action.gradient} p-5 transition-all hover:shadow-md cursor-pointer group ${action.borderHover}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-lg ${action.iconBg} shadow-sm`}>
                  <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{action.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
