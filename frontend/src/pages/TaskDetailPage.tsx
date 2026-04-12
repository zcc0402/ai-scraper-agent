import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useTaskStore } from '@/stores/useTaskStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Download, CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react'

function TaskDetailPage() {
  const { taskId } = Route.useParams()
  const { t } = useTranslation()
  const { currentTask, pollTaskStatus } = useTaskStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    pollTaskStatus(taskId)
    const interval = setInterval(() => pollTaskStatus(taskId), 3000)
    setMounted(true)
    return () => clearInterval(interval)
  }, [taskId, pollTaskStatus])

  if (!mounted || !currentTask) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-6 h-6 text-green-400" />
      case 'failed': return <AlertCircle className="w-6 h-6 text-red-400" />
      case 'cancelled': return <AlertCircle className="w-6 h-6 text-muted-foreground" />
      default: return <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
    }
  }

  const isCompleted = currentTask.status === 'completed'
  const isRunning = ['pending', 'planning', 'navigating', 'extracting', 'validating', 'exporting', 'retrying'].includes(currentTask.status)

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/tasks">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{t('tasks.title')}</h1>
          <p className="text-sm text-muted-foreground font-mono">{taskId}</p>
        </div>
      </div>

      {/* Status Card */}
      <Card className={`glass-card border-2 ${isCompleted ? 'border-green-500/30' : isRunning ? 'border-blue-500/30' : 'border-red-500/30'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {getStatusIcon(currentTask.status)}
              <div>
                <h2 className="text-xl font-semibold">
                  {t(`tasks.status.${currentTask.status}`) || currentTask.status}
                </h2>
                <p className="text-sm text-muted-foreground">{currentTask.progress}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">{t('create.instruction')}</p>
              <p className="font-medium">{currentTask.user_input}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">{t('tasks.filter')}</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(currentTask.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Section */}
      {isCompleted && currentTask.result && (
        <Card className="glass-card bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              {t('common.success')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">{t('home.totalTasks')}</p>
                <p className="text-2xl font-bold">
                  {currentTask.result.statistics?.total_records || '-'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">{t('create.format')}</p>
                <p className="text-2xl font-bold uppercase">
                  {currentTask.result.output_file?.split('.').pop() || 'JSON'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">{t('tasks.status.completed')}</p>
                <p className="text-2xl font-bold text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {t('common.success')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="shadow-lg shadow-green-500/20">
                <Download className="w-4 h-4 mr-2" />
                {t('common.confirm')}
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t('tasks.filter')}</h3>
              <div className="bg-background/50 rounded-xl p-4 border border-border/50 max-h-96 overflow-auto font-mono text-sm">
                <pre className="text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(currentTask.result.data?.slice(0, 10), null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Running State */}
      {isRunning && (
        <Card className="glass-card bg-card/50 text-center py-12">
          <CardContent>
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('tasks.status.planning')}</h3>
            <p className="text-muted-foreground">{currentTask.progress || t('common.loading')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { TaskDetailPage }

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailPage,
})
