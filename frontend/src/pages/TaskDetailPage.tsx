import { Card, Descriptions, Tag, Button, Space, Result } from 'antd'
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'
import { useTaskStore } from '@/stores/useTaskStore'
import { useEffect } from 'react'
import type { Task } from '@/types'

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

export function TaskDetailPage({ taskId }: { taskId: string }) {
  const { currentTask, pollTaskStatus, setCurrentTask, loading } = useTaskStore()

  useEffect(() => {
    // 轮询任务状态直到完成
    pollTaskStatus(taskId)
    const interval = setInterval(() => {
      pollTaskStatus(taskId)
    }, 3000)

    return () => clearInterval(interval)
  }, [taskId, pollTaskStatus])

  if (!currentTask) {
    return <Result status="loading" title="加载中..." />
  }

  const statusConfig = statusMap[currentTask.status] || { 
    color: 'default', 
    text: currentTask.status 
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link to="/tasks">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      </div>

      <Card className="mb-6" title="任务信息">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="任务ID">
            <code>{currentTask.task_id}</code>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(currentTask.created_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="完成时间">
            {currentTask.completed_at 
              ? new Date(currentTask.completed_at).toLocaleString('zh-CN') 
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="指令" span={2}>
            {currentTask.user_input}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {currentTask.status === 'completed' && currentTask.result && (
        <>
          <Card className="mb-6" title="数据概览">
            <Descriptions column={3}>
              <Descriptions.Item label="总记录数">
                {currentTask.result.statistics?.total_records || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="输出文件">
                {currentTask.result.output_file || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color="success">完成</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Space className="mt-4">
              <Button type="primary" icon={<DownloadOutlined />}>
                下载 JSON
              </Button>
            </Space>
          </Card>

          <Card title="数据预览（前10条）">
            <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">
              {JSON.stringify(currentTask.result.data?.slice(0, 10) || [], null, 2)}
            </pre>
          </Card>
        </>
      )}

      {currentTask.status === 'failed' && (
        <Card>
          <Result
            status="error"
            title="任务执行失败"
            subTitle={currentTask.error || '未知错误'}
            extra={
              <Link to="/tasks/create">
                <Button type="primary">重新创建任务</Button>
              </Link>
            }
          />
        </Card>
      )}

      {(currentTask.status === 'pending' || currentTask.status.includes('ing')) && (
        <Card>
          <Result
            status="info"
            title="任务执行中"
            subTitle={currentTask.progress || '请稍候...'}
          />
        </Card>
      )}
    </div>
  )
}
