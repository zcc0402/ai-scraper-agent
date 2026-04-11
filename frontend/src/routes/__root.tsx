import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AppLayout } from '@/components/AppLayout'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <div className="min-h-screen bg-gray-50">
        <AppLayout />
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </ConfigProvider>
  )
}
