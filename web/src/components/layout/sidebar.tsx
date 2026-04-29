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
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">AI Scraper</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Agent v1.0</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">导航</SidebarGroupLabel>
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
                      className="h-9 px-3 gap-2.5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 border-t">
          <UserNav />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
