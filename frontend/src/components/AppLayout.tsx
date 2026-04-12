import React from 'react'
import { Layout, Menu, theme } from 'antd'
import { Outlet, Link, useLocation } from '@tanstack/react-router'
import {
  HomeOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  SettingOutlined,
  RocketOutlined,
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: <Link to="/">首页</Link>,
  },
  {
    key: '/tasks',
    icon: <UnorderedListOutlined />,
    label: <Link to="/tasks">任务列表</Link>,
  },
  {
    key: '/tasks/create',
    icon: <PlusOutlined />,
    label: <Link to="/tasks/create">创建任务</Link>,
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: <Link to="/settings">设置</Link>,
  },
]

export function AppLayout() {
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  return (
    <Layout className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
      <Header 
        className="flex items-center px-6 glass" 
        style={{ 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(20px)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="flex items-center gap-3 mr-8 cursor-pointer">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/30">
            <RocketOutlined className="text-xl text-white" />
          </div>
          <h1 className="text-white text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
            AI Scraper Agent
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="flex-1 border-none"
          style={{ 
            background: 'transparent',
            color: 'rgba(255, 255, 255, 0.7)'
          }}
        />
      </Header>
      <Content className="px-6 py-8">
        <div
          className="glass-card p-8"
          style={{
            minHeight: 280,
            padding: 32,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}
        >
          <Outlet />
        </div>
      </Content>
      <Footer 
        className="text-center glass" 
        style={{ 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(20px)', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.5)'
        }}
      >
        AI Scraper Agent ©{new Date().getFullYear()} - 自然语言驱动的智能爬虫
      </Footer>
    </Layout>
  )
}
