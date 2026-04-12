import { Button } from 'antd'
import { Link } from '@tanstack/react-router'
import {
  DatabaseOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useTaskStore } from '@/stores/useTaskStore'
import { useEffect } from 'react'

export function HomePage() {
  const { tasks, fetchTasks } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    running: tasks.filter((t) =>
      ['pending', 'planning', 'navigating', 'extracting', 'validating'].includes(t.status)
    ).length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  }

  return (
    <div className="text-white max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16 py-10">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-medium text-blue-200">
          ✨ Powered by CrewAI & qwen3.6-plus
        </div>
        <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 drop-shadow-sm">
          AI Scraper Agent
        </h1>
        <p className="text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          用自然语言描述你想抓取的数据，AI 自动完成爬取任务
        </p>
        
        <div className="flex justify-center gap-4">
          <Link to="/tasks/create">
            <Button 
              type="primary" 
              icon={<RocketOutlined />} 
              size="large"
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-none h-12 px-8 text-lg rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
            >
              开始创建任务
            </Button>
          </Link>
          <Link to="/tasks">
            <Button 
              icon={<ArrowRightOutlined />} 
              size="large"
              className="bg-white/10 border-white/20 text-white h-12 px-8 text-lg rounded-xl backdrop-blur-md hover:bg-white/20 transition-all duration-300"
            >
              查看历史任务
            </Button>
          </Link>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {/* Total Tasks */}
        <div className="col-span-1 lg:col-span-2 glass-card p-8 relative overflow-hidden group hover:border-blue-400/50 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/30 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <DatabaseOutlined className="text-2xl text-blue-300" />
              </div>
              <span className="text-blue-200/80 font-medium">总任务数</span>
            </div>
            <div className="text-5xl font-bold text-white mb-2">{stats.total}</div>
            <div className="text-blue-200/60 text-sm">自项目启动以来的总请求量</div>
          </div>
        </div>

        {/* Completed */}
        <div className="glass-card p-8 relative overflow-hidden group hover:border-green-400/50 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/20 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-green-500/30 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircleOutlined className="text-2xl text-green-300" />
              </div>
              <span className="text-green-200/80 font-medium">已完成</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{stats.completed}</div>
            <div className="text-green-200/60 text-sm">成功提取数据</div>
          </div>
        </div>

        {/* Running */}
        <div className="glass-card p-8 relative overflow-hidden group hover:border-purple-400/50 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-purple-500/30 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <LoadingOutlined className="text-2xl text-purple-300" />
              </div>
              <span className="text-purple-200/80 font-medium">进行中</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{stats.running}</div>
            <div className="text-purple-200/60 text-sm">正在处理</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="glass-card p-10 mb-16">
        <h2 className="text-3xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
          <ThunderboltOutlined className="mr-2 text-yellow-400" />
          核心能力
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '💡',
              title: '自然语言驱动',
              desc: '无需编写代码，用大白话告诉 AI 你想抓取什么，它自动理解并执行。'
            },
            {
              icon: '🤖',
              title: '多角色协作',
              desc: '规划师、导航员、提取器分工合作，像专业团队一样处理复杂任务。'
            },
            {
              icon: '🎯',
              title: '智能抗变更',
              desc: '基于 Ref 机制，网站改版也能自动适应，无需频繁维护爬虫规则。'
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-blue-100/70 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
