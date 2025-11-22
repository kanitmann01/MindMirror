'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, Typography, Row, Col, Spin, Empty, Button, Tag, message, Tooltip } from 'antd';
import { FireFilled, TrophyOutlined, ShareAltOutlined, RocketOutlined, HomeOutlined } from '@ant-design/icons';
import { getPublicProfile, UserProfile, MediaItem, MoodEntry } from '@/lib/firestoreUtils';
import { calculateBadges, BADGES } from '@/lib/gamificationUtils';
import { calculateTimeDecay } from '@/lib/psychologyUtils';
import DataAvatar from '../../../components/DataAvatar';
import VantaBackground from '@/components/VantaBackground';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { generateGraphData } from '@/lib/graphUtils';

// Dynamically import Radar to avoid SSR issues
const Radar = dynamic(() => import('@ant-design/charts').then((mod) => mod.Radar), { ssr: false });
const MindMap = dynamic(() => import('@/components/MindMap'), { ssr: false });

const { Title, Text } = Typography;

import { useAuth } from '@/context/AuthContext';

// ...

const PublicProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<{ profile: UserProfile, media: MediaItem[], moods: MoodEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      const fetchProfile = async () => {
        const result = await getPublicProfile(username as string);
        setData(result);
        setLoading(false);
      };
      fetchProfile();
    }
  }, [username]);

  // --- Hook definitions must be unconditional ---
  
  // 1. Core Influences
  const coreInfluences = useMemo(() => {
      if (!data?.media || data.media.length === 0) return [];

      const scoredItems = data.media.map(item => {
          const rating = item.rating || 3;
          const decay = calculateTimeDecay(item.createdAt);
          const score = rating * decay;
          return { ...item, impactScore: score };
      });

      return scoredItems.sort((a, b) => b.impactScore - a.impactScore).slice(0, 3);
  }, [data?.media]);

  // 2. Graph Data
  const graphData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };
    try {
        return generateGraphData(data.profile, data.media, data.moods);
    } catch (e) {
        console.error("Graph generation error:", e);
        return { nodes: [], links: [] };
    }
  }, [data]);

  // 3. Latest Mood
  const latestMood = useMemo(() => {
    if (!data?.moods || data.moods.length === 0) return null;
    return data.moods[0].mood; // Assumes moods are sorted desc
  }, [data]);

  // ... Mind Radar Data (Commented out in original, kept commented) ...

  const handleShare = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      message.success('Profile URL copied to clipboard!');
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>;

  if (!data) return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="text-center">
            <Title level={3}>Profile Not Found</Title>
            <Text type="secondary">This profile is either private or does not exist.</Text>
            <div className="mt-4">
                <Link href="/">
                    <Button type="primary" icon={<HomeOutlined />}>Go Home</Button>
                </Link>
            </div>
          </div>
      </div>
  );

  const { profile, media, moods } = data;
  const config = profile.publicProfile!;
  const unlockedBadges = calculateBadges(profile, media, moods);
  const unlockedIds = new Set(unlockedBadges.map(b => b.id));
  const archetypeColor = profile.archetype?.color || '#3B82F6';
  
  // Meta tags fallback
  const avatarUrl = profile.photoURL || `https://api.dicebear.com/7.x/shapes/svg?seed=${config.username}`;
  const pageTitle = `${profile.displayName} (@${config.username}) - BrainMirror Profile`;
  const pageDescription = config.bio || `Explore ${profile.displayName}'s cognitive profile on BrainMirror.`;

  return (
    <VantaBackground>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:image" content={avatarUrl} />
      </Head>

      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
            <Link href="/">
                <Button icon={<RocketOutlined />} type="text" className="text-white hover:text-white/80 hover:bg-white/10">
                    BrainMirror
                </Button>
            </Link>
            <Button icon={<ShareAltOutlined />} onClick={handleShare}>Share Profile</Button>
        </div>

        {/* Header Section: Character Sheet Style (Synced with ProfilePage) */}
        <div className="bg-white rounded-2xl shadow-lg border-0 p-8 mb-8 relative overflow-hidden">
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
                        shape={profile.avatarShape}
                        complexity={profile.avatarComplexity}
                        size={140}
                        className="shadow-xl rounded-full bg-white p-1"
                    />
                </div>

                {/* User Info */}
                <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                        <Title level={2} className="!mb-0">{profile.displayName}</Title>
                        {config.visibleSections.archetype && profile.archetype && (
                            <Tag color={archetypeColor} className="text-sm px-3 py-1 rounded-full uppercase tracking-wide font-bold">
                                {profile.archetype.name}
                            </Tag>
                        )}
                    </div>
                    <Text type="secondary" className="text-lg block mb-4">@{config.username}</Text>
                    
                    {config.bio && (
                        <Text className="block mb-6 italic text-gray-600 max-w-xl">
                            "{config.bio}"
                        </Text>
                    )}

                    {/* Stats Row - Only show if achievements are visible, as it implies gamification */}
                    {(config.visibleSections.achievements ?? true) && (
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
                    )}
                </div>
            </div>
        </div>

        <Row gutter={[24, 24]}>
            {/* Mind Radar Removed */}
            {/* {config.visibleSections.ocean && (...)} */}

            {/* Right Col: Core Influences & Mind Map */}
            {config.visibleSections.mindmap && (
                <Col xs={24} md={24}>
                    <div className="flex flex-col gap-6 h-full">
                        {/* Mind Map Card - New */}
                        <Card
                            className="shadow-sm border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
                            title={<div className="flex items-center">Neural Galaxy <Tag color="purple" className="ml-2">Interactive</Tag></div>}
                            styles={{ body: { padding: 0 } }}
                        >
                             <MindMap 
                                data={graphData} 
                                currentMood={latestMood} 
                                readOnly={true} 
                            />
                        </Card>

                    <Card
                        title={
                            <div className="flex justify-between items-center">
                                <span>Core Influences</span>
                                <Tag color="blue">Top 3 Inputs</Tag>
                            </div>
                        }
                        className="shadow-sm border-0 bg-white/90 backdrop-blur-sm flex-1"
                    >
                        {coreInfluences.length > 0 ? (
                            <div className="space-y-4">
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
                            <Empty description="No influences recorded yet." />
                        )}
                    </Card>
                </div>
            </Col>
            )}
        </Row>

        {/* Badges Section */}
        {(config.visibleSections.achievements ?? true) && (
            <div className="mt-8">
                <Card title="Achievements" className="shadow-sm border-0 bg-white/90 backdrop-blur-sm">
                    <Row gutter={[16, 16]}>
                        {BADGES.map(badge => {
                            const isUnlocked = unlockedIds.has(badge.id);
                            // Only show unlocked badges on public profile to avoid clutter/confusion? 
                            // Or show all like private profile? Let's show all for consistency but maybe faded.
                            return (
                                <Col xs={24} sm={12} md={6} key={badge.id}>
                                    <div className={`p-3 rounded-lg border transition-all flex items-center gap-3 ${isUnlocked ? 'bg-blue-50 border-blue-100' : 'bg-gray-50/50 border-gray-100 opacity-40 grayscale'}`}>
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
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-white/60 text-xs pb-10">
            <p>Generated by BrainMirror AI • {new Date().getFullYear()}</p>
            {(!user || (data?.profile && user.uid !== data.profile.uid)) && (
                <Link href="/" className="hover:text-white underline">Create your own profile</Link>
            )}
        </div>
      </div>
    </VantaBackground>
  );
};

export default PublicProfilePage;
