import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, Row, Col, Statistic } from 'antd'
import {
  RocketOutlined,
  SearchOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          <RocketOutlined className="text-blue-500 mr-2" />
          AI Scraper Agent
        </h1>
        <p className="text-gray-600 text-lg">
          自然语言驱动的智能爬虫
        </p>
      </div>

      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="总任务数"
              value={0}
              prefix={<DatabaseOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="已完成"
              value={0}
              valueStyle={{ color: '#52c41a' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="进行中"
              value={0}
              valueStyle={{ color: '#1677ff' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="失败"
              value={0}
              valueStyle={{ color: '#ff4d4f' }}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <h2 className="text-2xl font-bold mb-4">快速开始</h2>
        <div className="space-y-4">
          <Link to="/tasks/create">
            <Button type="primary" icon={<SearchOutlined />} size="large" block>
              创建新任务
            </Button>
          </Link>
          
          <Link to="/tasks">
            <Button icon={<DatabaseOutlined />} size="large" block>
              查看任务列表
            </Button>
          </Link>

          <Link to="/settings">
            <Button icon={<SettingOutlined />} size="large" block>
              设置
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="mt-8" title="使用说明">
        <ul className="space-y-2 text-gray-700">
          <li>1. 点击"创建新任务"，用自然语言描述你想抓取的内容</li>
          <li>2. 系统会自动分析并执行爬取任务</li>
          <li>3. 在任务列表中可以查看所有任务的执行状态</li>
          <li>4. 完成后可以下载 JSON/CSV/Excel 格式的数据</li>
        </ul>
      </Card>
    </div>
  )
}
