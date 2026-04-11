import { Form, Input, Select, Button, Card, message } from 'antd'
import { RocketOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'
import { useTaskStore } from '@/stores/useTaskStore'
import { useState } from 'react'

export function CreateTaskForm() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { createTask, loading, error, clearError } = useTaskStore()

  const handleSubmit = async (values: any) => {
    try {
      clearError()
      const taskId = await createTask(values.user_input, values.output_format)
      message.success('任务已创建，正在执行...')
      navigate({ to: '/tasks/$taskId', params: { taskId } })
    } catch (err: any) {
      message.error(err.message || '创建任务失败')
    }
  }

  const examples = [
    "帮我抓取 Hacker News 前10条标题和链接",
    "抓取知乎热榜前20条的标题、回答数、浏览量",
    "抓取 GitHub Trending 今日热门项目",
    "抓取 Product Hunt 当日产品列表",
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">创建爬虫任务</h1>

      <Card className="mb-6">
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
            extra="用自然语言描述你想抓取的内容"
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

      <Card title="示例指令">
        <ul className="space-y-2">
          {examples.map((ex, i) => (
            <li
              key={i}
              className="text-gray-700 cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => form.setFieldsValue({ user_input: ex })}
            >
              💬 {ex}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
