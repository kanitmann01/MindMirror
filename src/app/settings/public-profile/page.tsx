'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Switch, Input, Button, App, Divider, Spin } from 'antd';
import { UserProfile, getUserProfile, saveUserProfile, isUsernameTaken, claimUsername } from '@/lib/firestoreUtils';
import { useAuth } from '@/context/AuthContext';
import { CopyOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import DataAvatar from '@/components/DataAvatar';

const { Title, Text, Paragraph } = Typography;

export default function PublicProfileSettings() {
    const { user } = useAuth();
    const { message } = App.useApp();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [isPublic, setIsPublic] = useState(false);
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    // Keep local avatar state for legacy selection, but now we prioritize the main settings
    const [avatar, setAvatar] = useState('default'); 
    const [visibleSections, setVisibleSections] = useState({
        ocean: true, mbti: true, archetype: true, mindmap: true, mood: false, achievements: true
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
                    setAvatar(p.publicProfile.avatar || 'default');
                    const defaults = { ocean: true, mbti: true, archetype: true, mindmap: true, mood: false, achievements: true };
                    setVisibleSections({
                         ...defaults,
                         ...p.publicProfile.visibleSections 
                    });
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
                avatar, // Keeping this for backward compatibility or specific override if needed later
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

    const previewProfile = () => {
        if (username) {
            window.open(`/u/${username}`, '_blank');
        } else {
            message.warning("Please set a username first!");
        }
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
                                    prefix="mindmirror.app/u/"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    onBlur={() => {
                                        setUsername(prev => prev.trim());
                                        checkUsername();
                                    }}
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
                                placeholder="Exploring the connection between my media diet and my mind..."
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                            />
                        </div>

                        {/* Avatar Preview (Now strictly using the Neural Glyph) */}
                        <div>
                            <Text strong className="block mb-3">Identity Preview</Text>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                 {profile && (
                                    <div className="bg-black rounded-full p-1 border-2 border-indigo-100 overflow-hidden" style={{width: 64, height: 64}}>
                                        <DataAvatar 
                                            archetypeId={profile.archetype?.id}
                                            archetypeColor={profile.archetype?.color || '#4ade80'}
                                            streak={profile.currentStreak || 0}
                                            openness={profile.oceanScore?.openness || 50}
                                            seed={profile.avatarSeed || 12345}
                                            theme={profile.avatarTheme || 'neon'}
                                            shape={profile.avatarShape}
                                            complexity={profile.avatarComplexity}
                                            size={56}
                                        />
                                    </div>
                                )}
                                <div>
                                    <Text type="secondary" className="text-xs block">
                                        Your public profile will use your <b>Neural Glyph</b>.
                                    </Text>
                                    <Button type="link" size="small" onClick={() => router.push('/settings')} style={{paddingLeft: 0}}>
                                        Customize Glyph
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div>
                            <Text strong className="block mb-3">Visibility Settings</Text>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex justify-between items-center border p-3 rounded bg-white">
                                    <span>Archetype</span>
                                    <Switch size="small" checked={visibleSections.archetype} onChange={v => setVisibleSections(p => ({ ...p, archetype: v }))} />
                                </div>
                                <div className="flex justify-between items-center border p-3 rounded bg-white">
                                    <span>OCEAN Traits</span>
                                    <Switch size="small" checked={visibleSections.ocean} onChange={v => setVisibleSections(p => ({ ...p, ocean: v }))} />
                                </div>
                                <div className="flex justify-between items-center border p-3 rounded bg-white">
                                    <span>Mind Map</span>
                                    <Switch size="small" checked={visibleSections.mindmap} onChange={v => setVisibleSections(p => ({ ...p, mindmap: v }))} />
                                </div>
                                <div className="flex justify-between items-center border p-3 rounded bg-white">
                                    <span>Deep Insights (MBTI)</span>
                                    <Switch size="small" checked={visibleSections.mbti} onChange={v => setVisibleSections(p => ({ ...p, mbti: v }))} />
                                </div>
                                <div className="flex justify-between items-center border p-3 rounded bg-white">
                                    <span>Mood History</span>
                                    <Switch size="small" checked={visibleSections.mood} onChange={v => setVisibleSections(p => ({ ...p, mood: v }))} />
                                </div>
                                <div className="flex justify-between items-center border p-3 rounded bg-white">
                                    <span>Achievements</span>
                                    <Switch size="small" checked={visibleSections.achievements} onChange={v => setVisibleSections(p => ({ ...p, achievements: v }))} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button type="default" icon={<EyeOutlined />} onClick={previewProfile} className="flex-1">
                                Preview Profile
                            </Button>
                            <Button type="primary" size="large" onClick={handleSave} loading={saving} className="flex-1">
                                Save Changes
                            </Button>
                        </div>
                    </div >
                )
                }
            </Card >
        </div >
    );
}
