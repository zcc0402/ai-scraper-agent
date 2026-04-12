import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useTaskStore } from '@/stores/useTaskStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link } from '@tanstack/react-router'
import { Search, Plus, Eye, Filter, Loader2 } from 'lucide-react'

function TaskListPage() {
  const { t } = useTranslation()
  const { tasks, fetchTasks, loading } = useTaskStore()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetchTasks()
    setMounted(true)
  }, [fetchTasks])

  if (!mounted) return null

  const filteredTasks = tasks.filter((task) => {
    if (searchText && !task.user_input.toLowerCase().includes(searchText.toLowerCase())) return false
    if (statusFilter !== 'all' && task.status !== statusFilter) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('tasks.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('home.subtitle')}</p>
        </div>
        <Link to="/tasks/create">
          <Button size="lg" className="w-full md:w-auto shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4 mr-2" />
            {t('tasks.newTask')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="glass-card bg-card/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('tasks.search')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t('tasks.filter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tasks.filter')}</SelectItem>
                  <SelectItem value="pending">{t('tasks.status.pending')}</SelectItem>
                  <SelectItem value="planning">{t('tasks.status.planning')}</SelectItem>
                  <SelectItem value="completed">{t('tasks.status.completed')}</SelectItem>
                  <SelectItem value="failed">{t('tasks.status.failed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="glass-card bg-card/50 text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">{t('tasks.search')}</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.task_id} className="glass-card bg-card/50 hover:border-primary/30 transition-all duration-300 group">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {t(`tasks.status.${task.status}`) || task.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-base font-medium truncate group-hover:text-primary transition-colors">
                      {task.user_input}
                    </h3>
                  </div>
                  <Link to="/tasks/$taskId" params={{ taskId: task.task_id }}>
                    <Button variant="outline" size="sm" className="w-full md:w-auto group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      <Eye className="w-4 h-4 mr-2" />
                      {t('tasks.view')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export { TaskListPage }

export const Route = createFileRoute('/tasks/')({
  component: TaskListPage,
})
