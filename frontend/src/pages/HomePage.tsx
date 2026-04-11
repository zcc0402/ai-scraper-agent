import { Card, Row, Col, Statistic, Button } from 'antd'
import { Link } from '@tanstack/react-router'
import {
  DatabaseOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { useTaskStore } from '@/stores/useTaskStore'
import { useEffect } from 'react'

export function HomePage() {
  const { tasks, fetchTasks } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // 统计数据
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    running: tasks.filter((t) =>
      ['pending', 'planning', 'navigating', 'extracting', 'validating'].includes(t.status)
    ).length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <RocketOutlined className="text-blue-500 mr-2" />
          AI Scraper Agent
        </h1>
        <p className="text-gray-500 text-lg">
          用自然语言描述你想抓取的数据，AI 自动完成爬取任务
        </p>
      </div>

      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={stats.total}
              prefix={<DatabaseOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.running}
              valueStyle={{ color: '#1677ff' }}
              prefix={<LoadingOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="失败"
              value={stats.failed}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      <Card title="快速开始" className="mb-6">
        <div className="space-y-4">
          <Link to="/tasks/create">
            <Button type="primary" icon={<RocketOutlined />} size="large" block>
              创建新任务
            </Button>
          </Link>
          <Link to="/tasks">
            <Button icon={<DatabaseOutlined />} size="large" block>
              查看任务列表
            </Button>
          </Link>
        </div>
      </Card>

      <Card title="使用说明">
        <ul className="space-y-2 text-gray-700">
          <li>💡 用自然语言描述你想抓取的内容，例如："抓取知乎热榜前20条标题"</li>
          <li>🤖 AI 会自动分析网页结构，提取目标数据</li>
          <li>📊 支持导出 JSON、CSV、Excel 多种格式</li>
          <li>⚡ 任务执行过程中可实时查看进度</li>
        </ul>
      </Card>
    </div>
  )
}
