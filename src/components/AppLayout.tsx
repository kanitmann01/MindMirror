'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography } from 'antd';
import {
  HomeOutlined,
  DashboardOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const { Header, Sider, Content } = Layout;

import VantaBackground from './VantaBackground';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signInWithGoogle, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/add-media',
      icon: <PlusCircleOutlined />,
      label: 'Add Media',
    },
    {
      key: '/import',
      icon: <CloudDownloadOutlined />,
      label: 'Import',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  const userMenu = [
    {
      key: 'logout',
      label: 'Logout',
      onClick: logout,
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => {
            if (broken) setCollapsed(true);
        }}
        style={{ background: '#fff' }}
      >
        <div className="demo-logo-vertical" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Typography.Title level={4} style={{ margin: 0, color: '#6B7FD7' }}>
             {collapsed ? 'BM' : 'BrainMirror'}
           </Typography.Title>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[pathname]}
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div>
            {user ? (
              <Dropdown menu={{ items: userMenu }}>
                 <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar src={user.photoURL} icon={<UserOutlined />} />
                    <span className="hidden sm:inline">{user.displayName}</span>
                 </div>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={signInWithGoogle}>Login</Button>
            )}
          </div>
        </Header>
        <VantaBackground className="!h-[calc(100vh-64px)] overflow-y-auto">
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: 'rgba(255, 255, 255, 0.8)', // Semi-transparent to see birds
              borderRadius: 8,
              overflow: 'initial',
              backdropFilter: 'blur(4px)'
            }}
          >
            {children}
          </Content>
        </VantaBackground>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
