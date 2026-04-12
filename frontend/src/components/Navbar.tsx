'use client'

import { Home, ListTodo, PlusCircle, Settings } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function Navbar() {
  const location = useLocation()
  const { t } = useTranslation()

  const navItems = [
    { href: '/', icon: Home, label: t('nav.home') },
    { href: '/tasks', icon: ListTodo, label: t('nav.tasks') },
    { href: '/tasks/create', icon: PlusCircle, label: t('nav.create') },
    { href: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  return (
    <>
      {/* Desktop Navigation (Top) */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass-nav h-16 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">{t('common.title')}</span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href as any}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Navigation (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href as any}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive && "bg-primary/10"
                )}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
