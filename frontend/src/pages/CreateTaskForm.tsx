import { Form, Input, Button, message, Select } from 'antd'
import { RocketOutlined, SendOutlined, StarOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'
import { useTaskStore } from '@/stores/useTaskStore'
import { useState } from 'react'

export function CreateTaskForm() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { createTask, loading } = useTaskStore()
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (values: any) => {
    try {
      const taskId = await createTask(values.user_input, values.output_format)
      message.success('🚀 任务已创建，AI 正在为您爬取数据...')
      navigate({ to: '/tasks/$taskId', params: { taskId } })
    } catch (err: any) {
      message.error(err.message || '创建任务失败')
    }
  }

  const examples = [
    "帮我抓取 Hacker News 前 10 条标题和链接",
    "抓取知乎热榜前 20 条的标题、回答数、浏览量",
    "抓取 GitHub Trending 今日热门项目",
    "抓取 Product Hunt 当日产品列表",
  ]

  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
          创建新任务
        </h1>
        <p className="text-blue-100/60">描述你想抓取的内容，AI 将为你自动完成</p>
      </div>

      <div className={`glass-card p-8 mb-8 transition-all duration-500 ${isFocused ? 'border-blue-400/50 shadow-[0_0_40px_rgba(59,130,246,0.3)]' : ''}`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ output_format: 'json' }}
        >
          <div className="mb-6 relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-blue-200 font-medium flex items-center gap-2">
                <StarOutlined className="text-yellow-400" />
                任务指令
              </label>
            </div>
            <Input.TextArea
              name="user_input"
              rows={5}
              placeholder="例如：帮我抓取 Hacker News 前 10 条标题和链接..."
              className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40 rounded-xl p-4 text-lg focus:bg-white/10 focus:border-blue-400/50 transition-all duration-300"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>

          <div className="mb-8">
            <label className="text-blue-200 font-medium mb-2 block">输出格式</label>
            <Select
              className="w-full"
              size="large"
              options={[
                { value: 'json', label: 'JSON 格式' },
                { value: 'csv', label: 'CSV 格式' },
                { value: 'excel', label: 'Excel 表格' },
              ]}
              defaultValue="json"
              onChange={(v) => form.setFieldsValue({ output_format: v })}
              dropdownStyle={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)' }}
              style={{ borderRadius: '12px' }}
            />
          </div>

          <Button
            type="primary"
            htmlType="submit"
            icon={<RocketOutlined />}
            loading={loading}
            size="large"
            block
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-none h-14 text-lg font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300"
          >
            开始任务
          </Button>
        </Form>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <SendOutlined className="text-blue-400" />
          示例指令
        </h3>
        <div className="space-y-3">
          {examples.map((ex, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-400/30 cursor-pointer transition-all duration-300 group"
              onClick={() => form.setFieldsValue({ user_input: ex })}
            >
              <div className="flex items-center justify-between">
                <span className="text-blue-100/80 group-hover:text-white transition-colors">{ex}</span>
                <SendOutlined className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
