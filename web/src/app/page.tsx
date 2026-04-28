import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F172A] relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#475569_1px,transparent_1px),linear-gradient(to_bottom,#475569_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Minimal glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#22C55E] rounded-full mix-blend-multiply filter blur-[128px] opacity-10" />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="text-center py-32 px-4">
          <div className="inline-block mb-8 px-4 py-2 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full">
            <span className="text-[#22C55E] text-sm font-medium tracking-wider uppercase">
              AI-Powered Scraping
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-[#F8FAFC]" style={{ textShadow: '0 0 40px rgba(34, 197, 94, 0.3)' }}>
            AI Scraper
          </h1>

          <p className="text-xl md:text-2xl text-[#94A3B8] mb-12 max-w-2xl mx-auto">
            用自然语言描述你想抓取的数据
            <br />
            <span className="text-[#F8FAFC] font-medium">AI 自动完成爬取</span>
          </p>

          <Link href="/tasks/create">
            <Button
              size="lg"
              className="group px-8 py-6 text-lg font-semibold bg-[#22C55E] hover:bg-[#16A34A] text-[#0F172A] rounded-lg shadow-lg shadow-[#22C55E]/25 hover:shadow-[#22C55E]/50 transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                开始爬取
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
          </Link>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-8 bg-[#1E293B] border border-[#475569] rounded-lg hover:border-[#22C55E]/50 transition-all duration-300">
              <div className="w-12 h-12 mb-6 bg-[#22C55E]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">自然语言驱动</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                无需编写代码或选择器，用自然语言描述需求即可
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-[#1E293B] border border-[#475569] rounded-lg hover:border-[#22C55E]/50 transition-all duration-300">
              <div className="w-12 h-12 mb-6 bg-[#22C55E]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">多角色 AI 协作</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                规划、导航、提取、验证，智能分工协作
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-[#1E293B] border border-[#475569] rounded-lg hover:border-[#22C55E]/50 transition-all duration-300">
              <div className="w-12 h-12 mb-6 bg-[#22C55E]/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">可扩展 Skill 系统</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                支持 OpenClaw 技能，一键安装扩展爬虫能力
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-4xl mx-auto px-4 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-[#1E293B] border border-[#475569] rounded-lg">
              <div className="text-4xl font-bold text-[#22C55E]">20+</div>
              <div className="text-[#94A3B8] mt-2 text-sm">LLM Providers</div>
            </div>
            <div className="p-6 bg-[#1E293B] border border-[#475569] rounded-lg">
              <div className="text-4xl font-bold text-[#22C55E]">7</div>
              <div className="text-[#94A3B8] mt-2 text-sm">浏览器工具</div>
            </div>
            <div className="p-6 bg-[#1E293B] border border-[#475569] rounded-lg">
              <div className="text-4xl font-bold text-[#22C55E]">&infin;</div>
              <div className="text-[#94A3B8] mt-2 text-sm">可扩展技能</div>
            </div>
            <div className="p-6 bg-[#1E293B] border border-[#475569] rounded-lg">
              <div className="text-4xl font-bold text-[#22C55E]">
                <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-[#94A3B8] mt-2 text-sm">实时推送</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
