import { Table, Tag, Button, Input, Select, Empty, Spin } from 'antd'
import { PlusOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'
import { useTaskStore } from '@/stores/useTaskStore'
import { useEffect, useState } from 'react'
import type { Task } from '@/types'

const { Search } = Input

const statusMap: Record<string, { color: string; text: string; icon: string }> = {
  pending: { color: 'default', text: '等待中', icon: '⏳' },
  planning: { color: 'processing', text: '规划中', icon: '📝' },
  navigating: { color: 'processing', text: '导航中', icon: '🌐' },
  extracting: { color: 'processing', text: '提取中', icon: '⚡' },
  validating: { color: 'warning', text: '验证中', icon: '🔍' },
  exporting: { color: 'warning', text: '导出中', icon: '📦' },
  completed: { color: 'success', text: '已完成', icon: '✅' },
  failed: { color: 'error', text: '失败', icon: '❌' },
  retrying: { color: 'warning', text: '重试中', icon: '🔄' },
  cancelled: { color: 'default', text: '已取消', icon: '🚫' },
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
      title: <span className="text-blue-200">任务指令</span>,
      dataIndex: 'user_input',
      key: 'user_input',
      ellipsis: true,
      render: (text: string) => (
        <span className="text-white font-medium">{text}</span>
      ),
    },
    {
      title: <span className="text-blue-200">状态</span>,
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        const config = statusMap[status] || { color: 'default', text: status, icon: '❓' }
        return (
          <Tag 
            color={config.color} 
            className="px-3 py-1 rounded-full border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <span className="mr-1">{config.icon}</span>
            {config.text}
          </Tag>
        )
      },
    },
    {
      title: <span className="text-blue-200">创建时间</span>,
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => (
        <span className="text-blue-100/60 text-sm">
          {new Date(date).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      title: <span className="text-blue-200">操作</span>,
      key: 'action',
      width: 120,
      render: (_: any, record: Task) => (
        <Link to="/tasks/$taskId" params={{ taskId: record.task_id }}>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            className="text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            查看
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="text-white max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
            任务列表
          </h1>
          <p className="text-blue-100/60">管理你的所有爬虫任务</p>
        </div>
        <Link to="/tasks/create">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-none rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
          >
            新建任务
          </Button>
        </Link>
      </div>

      <div className="glass-card p-6 mb-8">
        <div className="flex gap-4 mb-6">
          <Search
            placeholder="搜索任务指令..."
            allowClear
            className="flex-1"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined className="text-blue-300" />}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 160, borderRadius: '12px' }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusMap).map(([key, { text, icon }]) => ({
              value: key,
              label: `${icon} ${text}`,
            }))}
            dropdownStyle={{ 
              background: 'rgba(15, 23, 42, 0.9)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '12px'
            }}
          />
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredTasks}
            rowKey="task_id"
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: false,
              className: "text-white"
            }}
            locale={{ 
              emptyText: (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description={<span className="text-blue-100/60">暂无任务，点击"新建任务"开始</span>} 
                />
              ) 
            }}
            className="task-table"
            style={{ background: 'transparent' }}
          />
        </Spin>
      </div>
    </div>
  )
}
