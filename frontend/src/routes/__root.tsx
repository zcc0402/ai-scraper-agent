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
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        background: 'linear-gradient(135deg, #020817 0%, #0f172a 50%, #1e1b4b 100%)',
      }}>
        <Navbar />

        <main className="container mx-auto px-4 pt-20 pb-24 md:pt-24 md:pb-8 max-w-7xl">
          <Outlet />
        </main>

        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </ThemeProvider>
  )
}
