import { createFileRoute } from '@tanstack/react-router'
import { Card, Form, Input, Button, Select, message } from 'antd'
import { useState } from 'react'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      message.success('设置已保存')
    } catch (error: any) {
      message.error('保存失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">设置</h1>

      <Card className="mb-6" title="API 配置">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            api_base_url: 'http://localhost:8000',
            openai_model: 'gpt-4',
          }}
        >
          <Form.Item
            label="API 地址"
            name="api_base_url"
            rules={[{ required: true, message: '请输入 API 地址' }]}
          >
            <Input placeholder="http://localhost:8000" />
          </Form.Item>

          <Form.Item
            label="默认模型"
            name="openai_model"
            rules={[{ required: true, message: '请选择模型' }]}
          >
            <Select>
              <Select.Option value="gpt-4">GPT-4</Select.Option>
              <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
              <Select.Option value="claude-3-opus">Claude 3 Opus</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="爬虫默认设置">
        <Form layout="vertical" initialValues={{ default_timeout: 300 }}>
          <Form.Item label="默认输出格式" name="default_format">
            <Select>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="csv">CSV</Select.Option>
              <Select.Option value="excel">Excel</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="默认超时时间（秒）" name="default_timeout">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
