import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Form, Input, Select, Button, Card, message } from 'antd'
import { RocketOutlined } from '@ant-design/icons'
import { useState } from 'react'

export const Route = createFileRoute('/tasks/create')({
  component: CreateTaskPage,
})

function CreateTaskPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      // TODO: 调用实际的 API
      message.info('Phase 1: 脚手架搭建完成，API 功能开发中...')
      
      // 示例：跳转到任务列表
      setTimeout(() => {
        navigate({ to: '/tasks' })
      }, 1000)
    } catch (error: any) {
      message.error(error.message || '创建任务失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">创建爬虫任务</h1>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            output_format: 'json',
            timeout: 300,
          }}
        >
          <Form.Item
            label="任务指令"
            name="user_input"
            rules={[
              { required: true, message: '请输入任务指令' },
              { min: 5, message: '指令至少5个字符' },
            ]}
            extra="用自然语言描述你想抓取的内容，例如：'抓取知乎热榜前20条标题'"
          >
            <Input.TextArea
              rows={4}
              placeholder="例如：帮我抓取 Hacker News 前10条标题和链接"
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="输出格式"
            name="output_format"
            rules={[{ required: true, message: '请选择输出格式' }]}
          >
            <Select>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="csv">CSV</Select.Option>
              <Select.Option value="excel">Excel</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="超时时间（秒）"
            name="timeout"
            rules={[{ required: true, message: '请输入超时时间' }]}
            extra="任务执行的最大超时时间"
          >
            <Input.Number min={60} max={3600} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<RocketOutlined />}
              loading={loading}
              size="large"
              block
            >
              开始任务
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card className="mt-6" title="示例指令">
        <ul className="space-y-2 text-gray-700">
          <li>• "帮我抓取知乎热榜前20条的标题、回答数、浏览量"</li>
          <li>• "抓取淘宝机械键盘前50个商品的名称、价格、销量"</li>
          <li>• "提取 GitHub Trending 今日热门项目"</li>
          <li>• "抓取 Product Hunt 当日产品列表"</li>
        </ul>
      </Card>
    </div>
  )
}
