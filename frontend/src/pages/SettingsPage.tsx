import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Moon, Sun, Monitor, Globe, Palette, Database } from 'lucide-react'
import i18n from '@/i18n'

function SettingsPage() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('home.subtitle')}</p>
      </div>

      {/* Appearance */}
      <Card className="glass-card bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-5 h-5 text-primary" />
            {t('settings.theme')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'light', icon: Sun, label: t('settings.light') },
              { id: 'dark', icon: Moon, label: t('settings.dark') },
              { id: 'system', icon: Monitor, label: t('settings.system') },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                  theme === item.id
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-card/50 border-border/50 text-muted-foreground hover:bg-accent/50'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="glass-card bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="w-5 h-5 text-primary" />
            {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={i18n.language}
            onValueChange={(value) => i18n.changeLanguage(value)}
          >
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh">中文 (Chinese)</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* API Config (Placeholder) */}
      <Card className="glass-card bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Database className="w-5 h-5 text-primary" />
            {t('settings.api')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Auto-Retry</Label>
              <p className="text-sm text-muted-foreground">Automatically retry failed tasks</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { SettingsPage }

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
