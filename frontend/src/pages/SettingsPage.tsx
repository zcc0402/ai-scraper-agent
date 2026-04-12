import { Card, Form, Input, Button, Select, message, Switch } from 'antd'
import { SaveOutlined, ApiOutlined, DatabaseOutlined, BellOutlined } from '@ant-design/icons'
import { useState } from 'react'

export function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      // TODO: 保存设置到后端
      message.success('设置已保存')
    } catch (error: any) {
      message.error('保存失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-white max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
          设置
        </h1>
        <p className="text-blue-100/60">配置 API、模型和系统参数</p>
      </div>

      {/* API 配置 */}
      <div className="glass-card p-8 mb-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <ApiOutlined className="text-blue-300" />
          </div>
          API 配置
        </h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            api_base_url: 'http://localhost:8000',
            openai_model: 'qwen3.6-plus',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              label={<span className="text-blue-200">API 地址</span>}
              name="api_base_url"
              rules={[{ required: true, message: '请输入 API 地址' }]}
            >
              <Input 
                placeholder="http://localhost:8000" 
                className="bg-white/5 border-white/10 text-white rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-blue-200">默认模型</span>}
              name="openai_model"
              rules={[{ required: true, message: '请选择模型' }]}
            >
              <Select
                className="w-full"
                options={[
                  { value: 'qwen3.6-plus', label: 'Qwen 3.6 Plus (百炼)' },
                  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
                  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
                ]}
                dropdownStyle={{ 
                  background: 'rgba(15, 23, 42, 0.9)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px'
                }}
              />
            </Form.Item>
          </div>

          <Form.Item className="mt-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-none rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* 爬虫设置 */}
      <div className="glass-card p-8 mb-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <DatabaseOutlined className="text-purple-300" />
          </div>
          爬虫默认设置
        </h2>
        <Form layout="vertical" initialValues={{ default_timeout: 300, auto_retry: true }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item 
              label={<span className="text-blue-200">默认输出格式</span>} 
              name="default_format"
            >
              <Select
                className="w-full"
                options={[
                  { value: 'json', label: 'JSON' },
                  { value: 'csv', label: 'CSV' },
                  { value: 'excel', label: 'Excel' },
                ]}
                dropdownStyle={{ 
                  background: 'rgba(15, 23, 42, 0.9)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px'
                }}
              />
            </Form.Item>

            <Form.Item 
              label={<span className="text-blue-200">默认超时时间（秒）</span>} 
              name="default_timeout"
            >
              <Input 
                type="number" 
                className="bg-white/5 border-white/10 text-white rounded-xl"
              />
            </Form.Item>
          </div>

          <Form.Item name="auto_retry" valuePropName="checked">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="text-white font-medium">自动重试</div>
                <div className="text-blue-100/60 text-sm">任务失败时自动重试</div>
              </div>
              <Switch className="bg-blue-500" />
            </div>
          </Form.Item>
        </Form>
      </div>

      {/* 通知设置 */}
      <div className="glass-card p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-xl">
            <BellOutlined className="text-green-300" />
          </div>
          通知设置
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div>
              <div className="text-white font-medium">任务完成通知</div>
              <div className="text-blue-100/60 text-sm">任务完成后发送通知</div>
            </div>
            <Switch defaultChecked className="bg-green-500" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div>
              <div className="text-white font-medium">任务失败通知</div>
              <div className="text-blue-100/60 text-sm">任务失败时发送通知</div>
            </div>
            <Switch defaultChecked className="bg-green-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
