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
