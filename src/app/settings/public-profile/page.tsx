'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Switch, Input, Button, Form, App, Divider, Spin } from 'antd';
import { UserProfile, getUserProfile, saveUserProfile, isUsernameTaken, claimUsername } from '@/lib/firestoreUtils';
import { useAuth } from '@/context/AuthContext';
import { CopyOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function PublicProfileSettings() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [isPublic, setIsPublic] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [visibleSections, setVisibleSections] = useState({
      ocean: true, mbti: true, archetype: true, mindmap: true, mood: false
  });

  // Username Validation State
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    if (user) {
        const fetch = async () => {
            const p = await getUserProfile(user.uid);
            setProfile(p);
            if (p?.publicProfile) {
                setIsPublic(p.publicProfile.isPublic);
                setUsername(p.publicProfile.username);
                setBio(p.publicProfile.bio);
                setVisibleSections(p.publicProfile.visibleSections);
                setUsernameStatus('success'); // Assume existing is valid
            }
            setLoading(false);
        };
        fetch();
    }
  }, [user]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
      setUsername(val);
      setUsernameStatus('idle');
      setUsernameError('');
  };

  const checkUsername = async () => {
      if (username.length < 3) {
          setUsernameError('Min 3 chars');
          setUsernameStatus('error');
          return false;
      }
      if (profile?.publicProfile?.username === username) {
          setUsernameStatus('success');
          return true; // No change
      }

      setUsernameStatus('checking');
      const taken = await isUsernameTaken(username);
      if (taken) {
          setUsernameError('Taken');
          setUsernameStatus('error');
          return false;
      } else {
          setUsernameStatus('success');
          return true;
      }
  };

  const handleSave = async () => {
      if (!user) return;
      setSaving(true);
      
      try {
          // 1. Validate/Claim Username
          const isNameValid = await checkUsername();
          if (!isNameValid) {
              message.error("Invalid or taken username.");
              setSaving(false);
              return;
          }
          
          // Claim it specifically if changed or new
          if (profile?.publicProfile?.username !== username) {
               const claimed = await claimUsername(user.uid, username);
               if (!claimed) {
                   message.error("Failed to claim username. Try another.");
                   setSaving(false);
                   return;
               }
          }

          // 2. Save Profile Config
          const config = {
              username,
              isPublic,
              bio,
              visibleSections
          };

          await saveUserProfile(user.uid, { publicProfile: config });
          message.success("Public profile updated!");
          
          // Refresh local state
          const updated = await getUserProfile(user.uid);
          setProfile(updated);

      } catch (e) {
          console.error(e);
          message.error("Failed to save settings.");
      } finally {
          setSaving(false);
      }
  };

  const copyLink = () => {
      const url = `${window.location.origin}/u/${username}`;
      navigator.clipboard.writeText(url);
      message.success("Link copied!");
  };

  if (loading) return <Spin />;

  return (
    <div className="max-w-2xl mx-auto py-6">
        <Title level={2}>Public Profile</Title>
        <Paragraph>Showcase your mind map and personality insights to the world.</Paragraph>

        <Card className="shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-medium">Enable Public Profile</span>
                <Switch checked={isPublic} onChange={setIsPublic} />
            </div>

            {isPublic && (
                <div className="space-y-6">
                    <Divider />
                    
                    {/* Username */}
                    <div>
                        <Text strong className="block mb-2">Username</Text>
                        <div className="flex gap-2 items-center">
                            <Input 
                                prefix="brainmirror.app/u/" 
                                value={username} 
                                onChange={handleUsernameChange} 
                                onBlur={checkUsername}
                                status={usernameStatus === 'error' ? 'error' : ''}
                                suffix={
                                    usernameStatus === 'checking' ? <LoadingOutlined /> :
                                    usernameStatus === 'success' ? <CheckCircleOutlined className="text-green-500" /> :
                                    usernameStatus === 'error' ? <CloseCircleOutlined className="text-red-500" /> : null
                                }
                            />
                            {usernameStatus === 'success' && (
                                <Button icon={<CopyOutlined />} onClick={copyLink}>Copy Link</Button>
                            )}
                        </div>
                        {usernameError && <Text type="danger" className="text-xs">{usernameError}</Text>}
                    </div>

                    {/* Bio */}
                    <div>
                        <Text strong className="block mb-2">Bio / Status</Text>
                        <Input.TextArea 
                            rows={2} 
                            placeholder="Reviewing my cognitive patterns..." 
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                        />
                    </div>

                    {/* Toggles */}
                    <div>
                        <Text strong className="block mb-3">Visibility Settings</Text>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex justify-between items-center border p-3 rounded">
                                <span>Archetype</span>
                                <Switch size="small" checked={visibleSections.archetype} onChange={v => setVisibleSections(p => ({...p, archetype: v}))} />
                            </div>
                            <div className="flex justify-between items-center border p-3 rounded">
                                <span>OCEAN Traits</span>
                                <Switch size="small" checked={visibleSections.ocean} onChange={v => setVisibleSections(p => ({...p, ocean: v}))} />
                            </div>
                            <div className="flex justify-between items-center border p-3 rounded">
                                <span>Mind Map</span>
                                <Switch size="small" checked={visibleSections.mindmap} onChange={v => setVisibleSections(p => ({...p, mindmap: v}))} />
                            </div>
                            <div className="flex justify-between items-center border p-3 rounded">
                                <span>Deep Insights (MBTI)</span>
                                <Switch size="small" checked={visibleSections.mbti} onChange={v => setVisibleSections(p => ({...p, mbti: v}))} />
                            </div>
                             <div className="flex justify-between items-center border p-3 rounded">
                                <span>Mood History</span>
                                <Switch size="small" checked={visibleSections.mood} onChange={v => setVisibleSections(p => ({...p, mood: v}))} />
                            </div>
                        </div>
                    </div>

                    <Button type="primary" block size="large" onClick={handleSave} loading={saving}>
                        Save Changes
                    </Button>
                </div>
            )}
        </Card>
    </div>
  );
}

