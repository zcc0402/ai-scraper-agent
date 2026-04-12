import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTaskStore } from '@/stores/useTaskStore'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { 
  Database, CheckCircle2, Loader2, AlertCircle, 
  Sparkles, ArrowRight, Zap, Bot, ShieldCheck 
} from 'lucide-react'

function HomePage() {
  const { t } = useTranslation()
  const { tasks, fetchTasks } = useTaskStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetchTasks()
    setMounted(true)
  }, [fetchTasks])

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    running: tasks.filter((t) =>
      ['pending', 'planning', 'navigating', 'extracting', 'validating'].includes(t.status)
    ).length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
          <Sparkles className="w-3 h-3" />
          {t('common.title')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t('common.title')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t('common.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link to="/tasks/create">
            <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/25">
              {t('home.startNow')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/tasks">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {t('home.viewHistory')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid (Bento Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-400">{t('home.totalTasks')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span className="text-3xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-400">{t('home.completed')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-3xl font-bold">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-400">{t('home.running')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              <span className="text-3xl font-bold">{stats.running}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-400">{t('home.failed')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-3xl font-bold">{stats.failed}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="pt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          {t('home.features.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">{t('home.features.nlp.title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('home.features.nlp.desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">{t('home.features.agents.title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('home.features.agents.desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 space-y-3">
              <div className="p-3 w-fit rounded-xl bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">{t('home.features.adaptive.title')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('home.features.adaptive.desc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export { HomePage }

export const Route = createFileRoute('/')({
  component: HomePage,
})
