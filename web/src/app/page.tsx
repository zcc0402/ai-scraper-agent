import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Puzzle, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <Badge variant="secondary" className="mb-4">AI-Powered Scraping</Badge>
        <h1 className="text-5xl font-bold mb-4">AI Scraper</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          用自然语言描述你想抓取的数据，AI 自动完成爬取
        </p>
        <Link href="/tasks/create">
          <Button size="lg">开始爬取</Button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>自然语言驱动</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">无需编写代码或选择器，用自然语言描述需求即可</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>多角色 AI 协作</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">规划、导航、提取、验证，智能分工协作</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Puzzle className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>可扩展 Skill 系统</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">支持 OpenClaw 技能，一键安装扩展爬虫能力</p>
          </CardContent>
        </Card>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">20+</div>
            <div className="text-muted-foreground text-sm mt-1">LLM Providers</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">7</div>
            <div className="text-muted-foreground text-sm mt-1">浏览器工具</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">&infin;</div>
            <div className="text-muted-foreground text-sm mt-1">可扩展技能</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Zap className="h-8 w-8 mx-auto text-primary" />
            <div className="text-muted-foreground text-sm mt-1">实时推送</div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
