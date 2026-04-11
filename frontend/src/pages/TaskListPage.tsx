import { Table, Tag, Space, Button, Input, Select } from 'antd'
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'
import { useTaskStore } from '@/stores/useTaskStore'
import { useEffect, useState } from 'react'
import type { Task } from '@/types'

const { Search } = Input

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

export function TaskListPage() {
  const { tasks, fetchTasks, loading } = useTaskStore()
  const [statusFilter, setStatusFilter] = useState<string>()
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const filteredTasks = tasks.filter((task: Task) => {
    if (statusFilter && task.status !== statusFilter) return false
    if (searchText && !task.user_input.includes(searchText)) return false
    return true
  })

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'task_id',
      key: 'task_id',
      width: 200,
      ellipsis: true,
      render: (id: string) => <code className="text-xs">{id.slice(0, 8)}...</code>,
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
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">任务列表</h1>
        
        <div className="flex gap-4 mb-4">
          <Search
            placeholder="搜索任务指令..."
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
        dataSource={filteredTasks}
        rowKey="task_id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        locale={{ emptyText: '暂无任务' }}
      />
    </div>
  )
}
