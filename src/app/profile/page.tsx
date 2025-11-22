'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, Typography, Row, Col, Spin, Empty, Button, Tag, Divider, message } from 'antd';
import { UserOutlined, FireFilled, SettingOutlined, ShareAltOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, getMediaItems, getMoodEntries, UserProfile, MediaItem, MoodEntry } from '@/lib/firestoreUtils';
import { calculateBadges, BADGES } from '@/lib/gamificationUtils';
import { calculateTimeDecay } from '@/lib/psychologyUtils';
import DataAvatar from '@/components/DataAvatar';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import Radar to avoid SSR issues with charts
const Radar = dynamic(() => import('@ant-design/charts').then((mod) => mod.Radar), { ssr: false });

const { Title, Text, Paragraph } = Typography;

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [moods, setMoods] = useState<MoodEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [userProfile, userMedia, userMoods] = await Promise.all([
                    getUserProfile(user.uid),
                    getMediaItems(user.uid),
                    getMoodEntries(user.uid, 100)
                ]);
                setProfile(userProfile);
                setMedia(userMedia);
                setMoods(userMoods);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // --- Core Influences Logic ---
    const coreInfluences = useMemo(() => {
        if (!media || media.length === 0) return [];

        // Calculate Impact Score: (Rating * TimeDecay)
        // If rating is missing, assume 3.
        const scoredItems = media.map(item => {
            const rating = item.rating || 3;
            const decay = calculateTimeDecay(item.createdAt);
            const score = rating * decay;
            return { ...item, impactScore: score };
        });

        // Sort by score descending
        return scoredItems.sort((a, b) => b.impactScore - a.impactScore).slice(0, 3);
    }, [media]);

    // --- Mind Radar Data ---
    const radarData = useMemo(() => {
        if (!profile?.oceanScore) return [];
        return [
            { item: 'Openness', score: profile.oceanScore.openness },
            { item: 'Conscientiousness', score: profile.oceanScore.conscientiousness },
            { item: 'Extraversion', score: profile.oceanScore.extraversion },
            { item: 'Agreeableness', score: profile.oceanScore.agreeableness },
            { item: 'Neuroticism', score: profile.oceanScore.neuroticism },
        ];
    }, [profile]);

    const radarConfig = {
        data: radarData,
        xField: 'item',
        yField: 'score',
        meta: {
            score: {
                alias: 'Score',
                min: 0,
                max: 100,
            },
        },
        xAxis: {
            line: null,
            tickLine: null,
            grid: {
                line: {
                    style: {
                        lineDash: null,
                    },
                },
            },
        },
        yAxis: {
            line: null,
            tickLine: null,
            grid: {
                line: {
                    type: 'line',
                    style: {
                        lineDash: null,
                    },
                },
            },
        },
        area: {
            style: {
                fillOpacity: 0.2,
            },
        },
        color: '#8B5CF6', // Violet theme
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        message.success('Profile URL copied to clipboard!');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    if (!profile) {
        return <Empty description="Profile not found" />;
    }

    const unlockedBadges = calculateBadges(profile, media, moods);
    const unlockedIds = new Set(unlockedBadges.map(b => b.id));
    const archetypeColor = profile.archetype?.color || '#3B82F6';

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            {/* Top Bar: Actions */}
            <div className="flex justify-end gap-2 mb-4">
                <Button icon={<ShareAltOutlined />} onClick={handleShare}>Share</Button>
                <Link href="/settings">
                    <Button icon={<SettingOutlined />}>Settings</Button>
                </Link>
            </div>

            {/* Header Section: Character Sheet Style */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500" />

                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Procedural Avatar */}
                    <div className="flex-shrink-0">
                        <DataAvatar
                            archetypeId={profile.archetype?.id}
                            archetypeColor={archetypeColor}
                            streak={profile.currentStreak || 0}
                            openness={profile.oceanScore?.openness || 50}
                            seed={profile.avatarSeed || 12345}
                            theme={profile.avatarTheme || 'neon'}
                            size={140}
                            className="shadow-xl rounded-full bg-white p-1"
                        />
                    </div>

                    {/* User Info */}
                    <div className="flex-grow text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                            <Title level={2} className="!mb-0">{profile.displayName}</Title>
                            {profile.archetype && (
                                <Tag color={archetypeColor} className="text-sm px-3 py-1 rounded-full uppercase tracking-wide font-bold">
                                    {profile.archetype.name}
                                </Tag>
                            )}
                        </div>
                        <Text type="secondary" className="text-lg block mb-4">{profile.email}</Text>

                        {/* Stats Row */}
                        <div className="flex items-center justify-center md:justify-start gap-6">
                            <div className="flex items-center gap-2">
                                <FireFilled className="text-orange-500 text-xl" />
                                <div>
                                    <div className="font-bold text-xl leading-none">{profile.currentStreak || 0}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Day Streak</div>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <div className="flex items-center gap-2">
                                <TrophyOutlined className="text-yellow-500 text-xl" />
                                <div>
                                    <div className="font-bold text-xl leading-none">{unlockedBadges.length}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Badges</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                {/* Left Col: Mind Radar */}
                <Col xs={24} md={10}>
                    <Card title="Mind Radar" className="h-full shadow-sm border-slate-100">
                        <div className="h-[300px] w-full">
                            {radarData.length > 0 ? (
                                <Radar {...radarConfig} />
                            ) : (
                                <Empty description="Not enough data for Radar" />
                            )}
                        </div>
                        <div className="text-center mt-4">
                            <Text type="secondary" className="text-xs">
                                Visualizing your Big Five personality traits based on your inputs.
                            </Text>
                        </div>
                    </Card>
                </Col>

                {/* Right Col: Core Influences */}
                <Col xs={24} md={14}>
                    <Card
                        title={
                            <div className="flex justify-between items-center">
                                <span>Core Influences</span>
                                <Tag color="blue">Top 3 Inputs</Tag>
                            </div>
                        }
                        className="h-full shadow-sm border-slate-100"
                    >
                        {coreInfluences.length > 0 ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
                                    <Text className="text-blue-700 text-sm">
                                        These 3 items are currently driving a significant portion of your personality shifts based on recency and impact.
                                    </Text>
                                </div>

                                {coreInfluences.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors bg-white shadow-sm">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                            #{index + 1}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <Text strong className="block truncate text-base">{item.title}</Text>
                                            <div className="flex gap-2 mt-1">
                                                <Tag className="m-0 text-xs">{item.category}</Tag>
                                                {item.intent && item.intent[0] && <Tag color="purple" className="m-0 text-xs">{item.intent[0]}</Tag>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400 uppercase font-bold">Impact</div>
                                            <div className="text-lg font-bold text-blue-600">
                                                {Math.round(item.impactScore * 10) / 10}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty
                                description={
                                    <div className="flex flex-col items-center gap-2">
                                        <span>No influences yet.</span>
                                        <Link href="/add-media">
                                            <Button type="primary">Log your first item</Button>
                                        </Link>
                                    </div>
                                }
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Badges Section (Moved to bottom) */}
            <div className="mt-8">
                <Card title="Achievements" className="shadow-sm border-slate-100">
                    <Row gutter={[16, 16]}>
                        {BADGES.map(badge => {
                            const isUnlocked = unlockedIds.has(badge.id);
                            return (
                                <Col xs={24} sm={12} md={6} key={badge.id}>
                                    <div className={`p-3 rounded-lg border transition-all flex items-center gap-3 ${isUnlocked ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 opacity-50 grayscale'}`}>
                                        <div className="text-2xl">{badge.icon}</div>
                                        <div className="min-w-0">
                                            <Text strong className="block text-sm truncate">{badge.name}</Text>
                                            {isUnlocked && <Text className="text-xs text-green-600 font-bold">Unlocked</Text>}
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </Card>
            </div>
        </div>
    );
}
