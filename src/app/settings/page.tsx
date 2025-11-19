'use client';

import React from 'react';
import { Button, Card, Typography, App, Divider } from 'antd';
import { ExclamationCircleOutlined, DownloadOutlined, DeleteOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, getMediaItems, deleteUserData } from '@/lib/firestoreUtils';
import { useRouter } from 'next/navigation';
import FeedbackForm from '@/components/FeedbackForm'; 

const { Title, Paragraph } = Typography;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { message, modal } = App.useApp(); 
  const router = useRouter();

  const handleExport = async () => {
    if (!user) return;
    try {
      const [profile, media] = await Promise.all([
        getUserProfile(user.uid),
        getMediaItems(user.uid)
      ]);
      const data = { profile, media };
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

  return (
    <div className="max-w-2xl mx-auto py-10 flex flex-col gap-10"> 
      <Title level={2} className="!mb-0">Settings</Title>
      
      <Card title="Public Profile" className="shadow-sm mt-6">
        <Paragraph>
            Manage your public presence, bio, and what you share with the world.
        </Paragraph>
        <Button type="primary" icon={<UserOutlined />} onClick={() => router.push('/settings/public-profile')}>
            Manage Public Profile
        </Button>
      </Card>
      
      <Card title="Data Privacy & Control" className="shadow-sm mt-6">
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

      <Card title="Session" className="shadow-sm mt-6">
        <Button onClick={logout}>Logout</Button>
      </Card>

      <div className="mt-6">
        <FeedbackForm />
      </div>
    </div>
  );
}
