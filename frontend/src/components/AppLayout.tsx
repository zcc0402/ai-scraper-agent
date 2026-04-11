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
    <Layout className="min-h-screen">
      <Header className="flex items-center px-6">
        <div className="flex items-center gap-2 mr-8">
          <RocketOutlined className="text-2xl text-blue-400" />
          <h1 className="text-white text-xl font-bold">AI Scraper Agent</h1>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="flex-1 border-none"
        />
      </Header>
      <Content className="px-6 py-8 bg-gray-50">
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </div>
      </Content>
      <Footer className="text-center text-gray-500">
        AI Scraper Agent ©{new Date().getFullYear()} - 自然语言驱动的智能爬虫
      </Footer>
    </Layout>
  )
}
