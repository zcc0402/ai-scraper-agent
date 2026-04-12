import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Navbar } from '@/components/Navbar'
import { ThemeProvider } from '@/providers/ThemeProvider'
import '@/i18n'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        {/* Background Gradient */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background" />
        
        <Navbar />
        
        <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24 md:pb-8 max-w-7xl">
          <Outlet />
        </main>

        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </ThemeProvider>
  )
}
