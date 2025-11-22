'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, App, Divider, Select, Space, Row, Col, Spin } from 'antd';
import { ExclamationCircleOutlined, DownloadOutlined, DeleteOutlined, SafetyCertificateOutlined, UserOutlined, ReloadOutlined, SkinOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, getMediaItems, deleteUserData, saveUserProfile, UserProfile } from '@/lib/firestoreUtils';
import { useRouter } from 'next/navigation';
import FeedbackForm from '@/components/FeedbackForm'; 
import DataAvatar from '@/components/DataAvatar';

const { Title, Paragraph, Text } = Typography;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { message, modal } = App.useApp(); 
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Avatar Customization State
  const [avatarSeed, setAvatarSeed] = useState<number>(12345);
  const [avatarTheme, setAvatarTheme] = useState<string>('neon');
  const [avatarShape, setAvatarShape] = useState<'triangle' | 'hexagon' | 'circle' | 'star'>('triangle');
  const [avatarComplexity, setAvatarComplexity] = useState<'low' | 'medium' | 'high'>('medium');

  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
      if (user) {
          getUserProfile(user.uid).then(p => {
              if (p) {
                  setProfile(p);
                  setAvatarSeed(p.avatarSeed || Math.floor(Math.random() * 10000));
                  setAvatarTheme(p.avatarTheme || 'neon');
                  setAvatarShape(p.avatarShape || 'triangle');
                  setAvatarComplexity(p.avatarComplexity || 'medium');
              }
              setLoading(false);
          });
      }
  }, [user]);

  const handleSaveAvatar = async () => {
      if (!user) return;
      setSavingAvatar(true);
      try {
          await saveUserProfile(user.uid, {
              avatarSeed,
              avatarTheme,
              avatarShape,
              avatarComplexity
          });
          message.success('Visual identity updated.');
      } catch (e) {
          console.error(e);
          message.error('Failed to save settings.');
      } finally {
          setSavingAvatar(false);
      }
  };

  const handleRegenerateSeed = () => {
      setAvatarSeed(Math.floor(Math.random() * 10000));
  };

  const handleExport = async () => {
    if (!user) return;
    try {
      const [profileData, media] = await Promise.all([
        getUserProfile(user.uid),
        getMediaItems(user.uid)
      ]);
      const data = { profile: profileData, media };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brainmirror-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Data exported successfully.');
    } catch (e) {
      console.error(e);
      message.error('Failed to export data.');
    }
  };

  const handleDeleteAccount = () => {
    modal.confirm({
      title: 'Are you sure delete your account?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone. All your data will be permanently deleted.',
      okText: 'Yes, Delete Everything',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        if (!user) return;
        try {
           await deleteUserData(user.uid);
           await user.delete();
           message.success('Account and data deleted.');
           router.push('/');
        } catch (error: any) {
           console.error(error);
           if (error.code === 'auth/requires-recent-login') {
             message.error('For security, please log out and log in again before deleting your account.');
           } else {
             message.error('Failed to delete account: ' + error.message);
           }
        }
      },
    });
  };

  if (loading) {
      return <div className="flex justify-center p-10"><Spin size="large" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 flex flex-col gap-10 px-4"> 
      <Title level={2} className="!mb-0">Settings</Title>
      
      <Card title={<Space><SkinOutlined /> Neural Glyph Identity</Space>} className="shadow-sm mt-6">
        <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={10} className="flex justify-center">
                {profile && (
                    <div className="bg-black rounded-xl p-4 shadow-inner">
                        <DataAvatar 
                            archetypeId={profile.archetype?.id}
                            archetypeColor={profile.archetype?.color || '#4ade80'}
                            streak={profile.currentStreak || 0}
                            openness={profile.oceanScore?.openness || 50}
                            seed={avatarSeed}
                            theme={avatarTheme}
                            shape={avatarShape}
                            complexity={avatarComplexity}
                            size={180}
                        />
                    </div>
                )}
            </Col>
            <Col xs={24} sm={14}>
                <div className="flex flex-col gap-4">
                    <Paragraph>
                        Your <b>Neural Glyph</b> is a procedural representation of your psyche. 
                        Customize the base parameters to tune your visual identity.
                    </Paragraph>
                    
                    <div>
                        <Text strong className="block mb-2">Base Shape</Text>
                        <Select 
                            value={avatarShape} 
                            onChange={setAvatarShape} 
                            className="w-full"
                            options={[
                                { value: 'triangle', label: 'Triangle (Explorer)' },
                                { value: 'hexagon', label: 'Hexagon (Analyst)' },
                                { value: 'circle', label: 'Circle (Diplomat)' },
                                { value: 'star', label: 'Star (Creator)' },
                            ]}
                        />
                    </div>

                    <div>
                        <Text strong className="block mb-2">Visual Complexity</Text>
                        <Select 
                            value={avatarComplexity} 
                            onChange={setAvatarComplexity} 
                            className="w-full"
                            options={[
                                { value: 'low', label: 'Low (Minimalist)' },
                                { value: 'medium', label: 'Medium (Balanced)' },
                                { value: 'high', label: 'High (Intricate)' },
                            ]}
                        />
                    </div>

                    <div>
                        <Text strong className="block mb-2">Visual Theme</Text>
                        <Select 
                            value={avatarTheme} 
                            onChange={setAvatarTheme} 
                            className="w-full"
                            options={[
                                { value: 'neon', label: 'Neon Cyberpunk' },
                                { value: 'pastel', label: 'Soft Pastel' },
                                { value: 'monochrome', label: 'Monochrome Minimalist' },
                            ]}
                        />
                    </div>

                    <div className="flex gap-2">
                         <Button icon={<ReloadOutlined />} onClick={handleRegenerateSeed}>
                            Regenerate Variant
                        </Button>
                        <Button type="primary" onClick={handleSaveAvatar} loading={savingAvatar}>
                            Save Identity
                        </Button>
                    </div>
                </div>
            </Col>
        </Row>
      </Card>

      <Card title="Public Profile" className="shadow-sm">
        <Paragraph>
            Manage your public presence, bio, and what you share with the world.
        </Paragraph>
        <Button icon={<UserOutlined />} onClick={() => router.push('/settings/public-profile')}>
            Manage Public Profile
        </Button>
      </Card>
      
      <Card title="Data Privacy & Control" className="shadow-sm">
        <Paragraph>
          You own your data. You can export it anytime or delete your account permanently.
        </Paragraph>
        <div className="flex flex-wrap gap-4">
           <Button icon={<DownloadOutlined />} onClick={handleExport}>
             Export My Data
           </Button>
           <Button danger icon={<DeleteOutlined />} onClick={handleDeleteAccount}>
             Delete Account & Data
           </Button>
        </div>
        <Divider />
        <Button type="link" icon={<SafetyCertificateOutlined />} onClick={() => router.push('/privacy')} style={{ paddingLeft: 0 }}>
             View Privacy Policy & Ethical AI Statement
        </Button>
      </Card>

      <Card title="Session" className="shadow-sm">
        <Button onClick={logout}>Logout</Button>
      </Card>

      <div className="mt-6">
        <FeedbackForm />
      </div>
    </div>
  );
}
