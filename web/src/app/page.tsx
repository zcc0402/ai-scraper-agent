import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">AI Scraper Agent</h1>
        <p className="text-xl text-muted-foreground mb-8">
          用自然语言描述你想抓取的数据，AI 自动完成爬取
        </p>
        <Link href="/tasks/create">
          <Button size="lg">开始爬取</Button>
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>自然语言驱动</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              无需编写代码或选择器，用自然语言描述需求即可
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>多角色 AI 协作</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              规划、导航、提取、验证，智能分工协作
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>可扩展 Skill 系统</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              支持 OpenClaw 技能，一键安装扩展爬虫能力
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
