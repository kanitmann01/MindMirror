'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Drawer, Grid } from 'antd';
import {
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
import VantaBackground from './VantaBackground';
import { getUserProfile, UserProfile } from '@/lib/firestoreUtils';
import DataAvatar from '@/components/DataAvatar';

import StreakCounter from './StreakCounter';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, signInWithGoogle, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const screens = useBreakpoint();

  // Check if we are on a small screen
  const isMobile = !screens.lg;

  useEffect(() => {
    // Close mobile drawer when path changes
    setMobileDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
      if (user) {
          getUserProfile(user.uid).then(setProfile);
      }
  }, [user]);

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
      key: '/profile',
      label: 'Profile',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'logout',
      label: 'Logout',
      onClick: logout,
    }
  ];

  const SidebarContent = (
    <>
      <div className="demo-logo-vertical" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0, color: '#6B7FD7' }}>
          {collapsed && !isMobile ? 'BM' : 'MindMirror'}
        </Typography.Title>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[pathname]}
        items={items}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sider */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
        >
          {SidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer Sider */}
      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          styles={{ body: { padding: 0 } }}
          width={240}
        >
          {SidebarContent}
        </Drawer>
      )}

      <Layout>
        <Header style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setMobileDrawerOpen(true) : setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div className="flex items-center gap-4">
            {user && <StreakCounter />}

            {user ? (
              <Dropdown menu={{ items: userMenu }}>
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="bg-black rounded-full p-1 overflow-hidden border border-gray-200" style={{ width: 32, height: 32 }}>
                      <DataAvatar 
                        archetypeId={profile?.archetype?.id}
                        archetypeColor={profile?.archetype?.color || '#4ade80'}
                        streak={0} 
                        openness={profile?.oceanScore?.openness || 50}
                        seed={profile?.avatarSeed || (user.uid ? user.uid.charCodeAt(0) : 12345)}
                        theme={profile?.avatarTheme || 'neon'}
                        shape={profile?.avatarShape || 'circle'}
                        complexity={profile?.avatarComplexity || 'medium'}
                        size={24} 
                    />
                  </div>
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
              margin: isMobile ? '16px' : '24px 16px', // Reduce margin on mobile
              padding: isMobile ? 16 : 24, // Reduce padding on mobile
              minHeight: 280,
              background: 'rgba(255, 255, 255, 0.8)',
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
