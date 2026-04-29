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
  const user = {
    name: "用户",
    email: "user@example.com",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 h-10 px-3" />}>
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {user.name[0]}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:inline">
          {user.name}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User className="h-4 w-4 mr-2" />
          个人中心
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings className="h-4 w-4 mr-2" />
          系统设置
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
