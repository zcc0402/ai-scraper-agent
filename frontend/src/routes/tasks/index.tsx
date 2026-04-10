import { createFileRoute } from '@tanstack/react-router'
import { Button, Table, Tag, Space, Input, Select } from 'antd'
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Task } from '@/types'

export const Route = createFileRoute('/tasks/')({
  component: TasksPage,
})

const { Search } = Input

// 任务状态映射
const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '等待中' },
  planning: { color: 'processing', text: '规划中' },
  navigating: { color: 'processing', text: '导航中' },
  extracting: { color: 'processing', text: '提取中' },
  validating: { color: 'warning', text: '验证中' },
  exporting: { color: 'warning', text: '导出中' },
  completed: { color: 'success', text: '已完成' },
  failed: { color: 'error', text: '失败' },
  retrying: { color: 'warning', text: '重试中' },
  cancelled: { color: 'default', text: '已取消' },
}

function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>()
  const [searchText, setSearchText] = useState('')

  // TODO: 从 store 加载实际数据
  const mockTasks: Task[] = [
    {
      task_id: 'demo-001',
      user_input: '抓取 Hacker News 前10条标题',
      status: 'completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      result: {
        data: [],
        output_file: '/data/outputs/task_001.json',
        statistics: { total_records: 10, fields: ['title', 'url'] },
      },
    },
  ]

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'task_id',
      key: 'task_id',
      width: 200,
      ellipsis: true,
    },
    {
      title: '指令',
      dataIndex: 'user_input',
      key: 'user_input',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = statusMap[status] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Task) => (
        <Space>
          <Link to="/tasks/$taskId" params={{ taskId: record.task_id }}>
            <Button type="link" icon={<EyeOutlined />} size="small">
              查看
            </Button>
          </Link>
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">任务列表</h1>
        
        <div className="flex gap-4 mb-4">
          <Search
            placeholder="搜索任务..."
            allowClear
            style={{ flex: 1 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            {Object.entries(statusMap).map(([key, { text }]) => (
              <Select.Option key={key} value={key}>
                {text}
              </Select.Option>
            ))}
          </Select>
          <Link to="/tasks/create">
            <Button type="primary" icon={<PlusOutlined />}>
              新建任务
            </Button>
          </Link>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={mockTasks}
        rowKey="task_id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  )
}
