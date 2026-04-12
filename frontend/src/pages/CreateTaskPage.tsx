import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTaskStore } from '@/stores/useTaskStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Rocket, Sparkles, Send, ArrowRight } from 'lucide-react'

function CreateTaskPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createTask, loading } = useTaskStore()
  const [userInput, setUserInput] = useState('')
  const [outputFormat, setOutputFormat] = useState<'json' | 'csv' | 'excel'>('json')
  const [isFocused, setIsFocused] = useState(false)

  const examples = [
    t('create.examples.list.0'),
    t('create.examples.list.1'),
    t('create.examples.list.2'),
  ]

  const handleSubmit = async () => {
    if (!userInput.trim()) return
    try {
      const taskId = await createTask(userInput, outputFormat)
      navigate({ to: '/tasks/$taskId', params: { taskId } })
    } catch (err: any) {
      alert(err.message || t('common.error'))
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold">{t('create.title')}</h1>
        <p className="text-muted-foreground">{t('home.subtitle')}</p>
      </div>

      <Card className="glass-card bg-card/50">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {t('create.instruction')}
            </Label>
            <div className={`transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/50' : ''} rounded-xl`}>
              <Textarea
                placeholder={t('create.placeholder')}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="min-h-[160px] text-lg resize-none bg-background/50 border-border/50 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">{t('create.format')}</Label>
            <Select value={outputFormat} onValueChange={(v: any) => setOutputFormat(v)}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="JSON" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold shadow-lg shadow-primary/25"
            onClick={handleSubmit}
            disabled={!userInput.trim() || loading}
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                {t('create.submit')}
                <Rocket className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Send className="w-5 h-5 text-muted-foreground" />
          {t('create.examples.title')}
        </h3>
        <div className="grid gap-3">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setUserInput(ex)}
              className="text-left p-4 rounded-xl bg-card/50 border border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 group flex items-center justify-between"
            >
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">{ex}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export { CreateTaskPage }

export const Route = createFileRoute('/tasks/create')({
  component: CreateTaskPage,
})
