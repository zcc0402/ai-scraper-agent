import { Card, Descriptions, Tag, Button, Space, Result, Spin, Empty } from 'antd'
import { ArrowLeftOutlined, DownloadOutlined, CheckCircleOutlined, LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'
import { useTaskStore } from '@/stores/useTaskStore'
import { useEffect } from 'react'

const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
  pending: { color: 'default', text: '等待中', icon: <span className="text-gray-400">⏳</span> },
  planning: { color: 'processing', text: '规划中', icon: <LoadingOutlined className="text-blue-400" /> },
  navigating: { color: 'processing', text: '导航中', icon: <LoadingOutlined className="text-blue-400" /> },
  extracting: { color: 'processing', text: '提取中', icon: <LoadingOutlined className="text-blue-400" /> },
  validating: { color: 'warning', text: '验证中', icon: <LoadingOutlined className="text-yellow-400" /> },
  exporting: { color: 'warning', text: '导出中', icon: <LoadingOutlined className="text-yellow-400" /> },
  completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined className="text-green-400" /> },
  failed: { color: 'error', text: '失败', icon: <CloseCircleOutlined className="text-red-400" /> },
  retrying: { color: 'warning', text: '重试中', icon: <LoadingOutlined className="text-yellow-400" /> },
  cancelled: { color: 'default', text: '已取消', icon: <CloseCircleOutlined className="text-gray-400" /> },
}

export function TaskDetailPage({ taskId }: { taskId: string }) {
  const { currentTask, pollTaskStatus, loading } = useTaskStore()

  useEffect(() => {
    pollTaskStatus(taskId)
    const interval = setInterval(() => {
      pollTaskStatus(taskId)
    }, 3000)

    return () => clearInterval(interval)
  }, [taskId, pollTaskStatus])

  if (!currentTask) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  const statusConfig = statusMap[currentTask.status] || { 
    color: 'default', 
    text: currentTask.status,
    icon: null 
  }

  const isCompleted = currentTask.status === 'completed'
  const isRunning = ['pending', 'planning', 'navigating', 'extracting', 'validating', 'exporting', 'retrying'].includes(currentTask.status)
  const isFailed = currentTask.status === 'failed'

  return (
    <div className="text-white max-w-5xl mx-auto">
      <div className="mb-8">
        <Link to="/tasks">
          <Button 
            icon={<ArrowLeftOutlined />} 
            className="bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            返回列表
          </Button>
        </Link>
      </div>

      {/* Status Card */}
      <div className={`glass-card p-8 mb-8 ${isCompleted ? 'border-green-400/30' : isFailed ? 'border-red-400/30' : 'border-blue-400/30'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
              任务详情
            </h1>
            <p className="text-blue-100/60 text-sm">ID: {currentTask.task_id}</p>
          </div>
          <div className="flex items-center gap-3">
            {statusConfig.icon}
            <Tag 
              color={statusConfig.color} 
              className="px-4 py-2 rounded-full text-base border-white/10 bg-white/5"
            >
              {statusConfig.text}
            </Tag>
          </div>
        </div>

        <Descriptions column={2} bordered className="custom-descriptions">
          <Descriptions.Item label={<span className="text-blue-200">任务指令</span>} span={2}>
            <span className="text-white font-medium">{currentTask.user_input}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-blue-200">创建时间</span>}>
            <span className="text-blue-100/70">{new Date(currentTask.created_at).toLocaleString('zh-CN')}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-blue-200">完成时间</span>}>
            <span className="text-blue-100/70">
              {currentTask.completed_at ? new Date(currentTask.completed_at).toLocaleString('zh-CN') : '-'}
            </span>
          </Descriptions.Item>
          {currentTask.progress && (
            <Descriptions.Item label={<span className="text-blue-200">当前进度</span>} span={2}>
              <span className="text-blue-100/80">{currentTask.progress}</span>
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      {/* Result Section */}
      {isCompleted && currentTask.result && (
        <div className="glass-card p-8 mb-8 border-green-400/20">
          <h2 className="text-xl font-bold mb-6 text-green-300 flex items-center gap-2">
            <CheckCircleOutlined />
            数据概览
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-blue-100/60 text-sm mb-1">总记录数</div>
              <div className="text-3xl font-bold text-white">
                {currentTask.result.statistics?.total_records || '-'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-blue-100/60 text-sm mb-1">输出格式</div>
              <div className="text-2xl font-bold text-blue-300 uppercase">
                {currentTask.result.output_file?.split('.').pop() || 'JSON'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-blue-100/60 text-sm mb-1">状态</div>
              <div className="text-2xl font-bold text-green-400 flex items-center gap-2">
                <CheckCircleOutlined /> 完成
              </div>
            </div>
          </div>

          <Space size="middle">
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              className="bg-gradient-to-r from-green-500 to-emerald-600 border-none rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-300"
            >
              下载数据
            </Button>
          </Space>
        </div>
      )}

      {/* Data Preview */}
      {isCompleted && currentTask.result?.data && (
        <div className="glass-card p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 text-blue-300">数据预览（前 10 条）</h2>
          <div className="bg-black/30 rounded-xl p-6 border border-white/10 max-h-96 overflow-auto">
            <pre className="text-blue-100/80 text-sm font-mono whitespace-pre-wrap">
              {JSON.stringify(currentTask.result.data.slice(0, 10), null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Failed State */}
      {isFailed && (
        <div className="glass-card p-8 mb-8 border-red-400/20">
          <Result
            status="error"
            title={<span className="text-red-400">任务执行失败</span>}
            subTitle={
              <div className="text-red-200/60 mt-2 p-4 rounded-lg bg-red-500/10 border border-red-400/20 text-left">
                {currentTask.error || '未知错误'}
              </div>
            }
            extra={
              <Link to="/tasks/create">
                <Button 
                  type="primary"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 border-none rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
                >
                  重新创建任务
                </Button>
              </Link>
            }
          />
        </div>
      )}

      {/* Running State */}
      {isRunning && (
        <div className="glass-card p-8 mb-8 border-blue-400/20">
          <Result
            status="info"
            icon={<LoadingOutlined className="text-blue-400 text-4xl" />}
            title={<span className="text-blue-300">任务执行中</span>}
            subTitle={
              <div className="text-blue-200/60 mt-2">
                {currentTask.progress || '请稍候，AI 正在为您抓取数据...'}
              </div>
            }
          />
        </div>
      )}
    </div>
  )
}
