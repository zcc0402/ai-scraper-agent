import { createFileRoute, notFound } from '@tanstack/react-router'
import { Button, Card, Descriptions, Tag, Space, Result } from 'antd'
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'
import type { Task } from '@/types'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailPage,
  loader: async ({ params }) => {
    // TODO: 从 API 加载任务详情
    return { taskId: params.taskId }
  },
})

function TaskDetailPage() {
  const { taskId } = Route.useLoaderData()

  // TODO: 加载实际数据
  const mockTask: Task = {
    task_id: taskId,
    user_input: '抓取 Hacker News 前10条标题',
    status: 'completed',
    progress: '完成',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    result: {
      data: [
        { title: 'Show HN: Example Project', url: 'https://example.com', points: 100 },
      ],
      output_file: '/data/outputs/task_001.json',
      statistics: { total_records: 10, fields: ['title', 'url', 'points'] },
    },
  }

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

  const statusConfig = statusMap[mockTask.status] || { color: 'default', text: mockTask.status }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link to="/tasks">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      </div>

      <Card className="mb-6" title="任务信息">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="任务ID">{mockTask.task_id}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(mockTask.created_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="完成时间">
            {mockTask.completed_at ? new Date(mockTask.completed_at).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="指令" span={2}>
            {mockTask.user_input}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {mockTask.status === 'completed' && mockTask.result && (
        <>
          <Card className="mb-6" title="数据概览">
            <Descriptions column={3}>
              <Descriptions.Item label="总记录数">
                {mockTask.result.statistics.total_records}
              </Descriptions.Item>
              <Descriptions.Item label="字段列表">
                {mockTask.result.statistics.fields.join(', ')}
              </Descriptions.Item>
              <Descriptions.Item label="输出文件">
                {mockTask.result.output_file}
              </Descriptions.Item>
            </Descriptions>

            <Space className="mt-4">
              <Button type="primary" icon={<DownloadOutlined />}>
                下载 JSON
              </Button>
              <Button icon={<DownloadOutlined />}>
                下载 CSV
              </Button>
              <Button icon={<DownloadOutlined />}>
                下载 Excel
              </Button>
            </Space>
          </Card>

          <Card title="数据预览（前10条）">
            <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(mockTask.result.data.slice(0, 10), null, 2)}
            </pre>
          </Card>
        </>
      )}

      {mockTask.status === 'failed' && (
        <Card>
          <Result
            status="error"
            title="任务执行失败"
            subTitle={mockTask.error || '未知错误'}
          />
        </Card>
      )}

      {(mockTask.status === 'pending' || mockTask.status.includes('ing')) && (
        <Card>
          <Result
            status="info"
            title="任务执行中"
            subTitle={mockTask.progress || '请稍候...'}
          />
        </Card>
      )}
    </div>
  )
}
