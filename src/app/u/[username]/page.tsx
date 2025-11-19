'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, Typography, Row, Col, Tag, Spin, Alert, Avatar, Divider, Statistic, Button, Tooltip } from 'antd';
import { getPublicProfile, UserProfile, MediaItem, MoodEntry } from '@/lib/firestoreUtils';
import MindMap from '@/components/MindMap';
import { transformToGraphData } from '@/lib/graphUtils';
import { UserOutlined, GlobalOutlined, ShareAltOutlined, TwitterOutlined, FacebookOutlined, LinkedinOutlined } from '@ant-design/icons';
import VantaBackground from '@/components/VantaBackground';
import Head from 'next/head';

const { Title, Text, Paragraph } = Typography;

const PublicProfilePage = () => {
  const { username } = useParams();
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

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>;

  if (!data) return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="text-center">
            <Title level={3}>Profile Not Found</Title>
            <Text type="secondary">This profile is either private or does not exist.</Text>
          </div>
      </div>
  );

  const { profile, media, moods } = data;
  const config = profile.publicProfile!;
  const avatarUrl = config.avatar && config.avatar !== 'default' 
      ? `https://api.dicebear.com/7.x/${config.avatar === 'robot' ? 'bottts' : config.avatar === 'mind' ? 'identicon' : 'shapes'}/svg?seed=${config.avatar === 'robot' ? 'Brain' : config.avatar === 'mind' ? 'Mind' : 'Mirror'}`
      : profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${config.username}`;

  const graphData = transformToGraphData(profile, media);
  
  // SEO & Social Share
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pageTitle = `${profile.displayName} (@${config.username}) - BrainMirror Profile`;
  const pageDescription = config.bio || `Explore ${profile.displayName}'s cognitive profile, personality traits, and mind map on BrainMirror.`;
  
  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(pageUrl)}`, '_blank');
  };
  
  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank');
  };
  
  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, '_blank');
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <VantaBackground>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={avatarUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={avatarUrl} />
      </Head>
      <div className="max-w-6xl mx-auto py-10 px-4">
        {/* Header / Hero */}
        <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-md">
           <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <Avatar size={120} src={avatarUrl} icon={<UserOutlined />} className="border-4 border-indigo-100" />
              <div className="flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                      <Title level={2} style={{ marginBottom: 0 }}>{profile.displayName}</Title>
                      <Tag color="blue" icon={<GlobalOutlined />}>Public Profile</Tag>
                  </div>
                  <Text type="secondary" className="text-lg">@{config.username}</Text>
                  
                  {config.bio && (
                      <Paragraph className="mt-4 text-gray-600 max-w-2xl italic">
                          "{config.bio}"
                      </Paragraph>
                  )}
                  
                  <div className="flex gap-2 mt-4 justify-center md:justify-start flex-wrap">
                      {config.visibleSections.archetype && profile.archetype && (
                          <Tag color={profile.archetype.color} className="text-base py-1 px-3 rounded-full">
                              {profile.archetype.name}
                          </Tag>
                      )}
                  </div>
                  
                  {/* Social Share Buttons */}
                  <div className="mt-4 flex gap-2 justify-center md:justify-start">
                      <Tooltip title="Share on Twitter">
                          <Button icon={<TwitterOutlined />} onClick={shareToTwitter} size="small" />
                      </Tooltip>
                      <Tooltip title="Share on Facebook">
                          <Button icon={<FacebookOutlined />} onClick={shareToFacebook} size="small" />
                      </Tooltip>
                      <Tooltip title="Share on LinkedIn">
                          <Button icon={<LinkedinOutlined />} onClick={shareToLinkedIn} size="small" />
                      </Tooltip>
                      <Tooltip title="Copy Link">
                          <Button icon={<ShareAltOutlined />} onClick={copyLink} size="small" />
                      </Tooltip>
                  </div>
              </div>
           </div>
        </Card>

        <Row gutter={[24, 24]}>
            {/* Left Column */}
            <Col xs={24} md={8}>
                <div className="flex flex-col gap-6">
                    {config.visibleSections.ocean && profile.oceanScore && (
                        <Card title="Personality Traits (OCEAN)" className="shadow-sm bg-white/90">
                             <div className="space-y-3">
                                {Object.entries(profile.oceanScore).map(([k, v]) => (
                                    <div key={k}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="capitalize text-gray-600">{k}</span>
                                            <span className="font-bold text-gray-800">{v}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${v}%` }} />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </Card>
                    )}

                    {config.visibleSections.mood && moods.length > 0 && (
                        <Card title="Recent Vibe" className="shadow-sm bg-white/90">
                             <div className="flex gap-2 justify-center">
                                {moods.slice(0, 5).map((m, idx) => (
                                    <Tooltip key={idx} title={`${m.mood} (${new Date(m.createdAt!).toLocaleDateString()})`}>
                                        <div className="text-2xl cursor-default">
                                            {m.mood === 'Happy' ? '😊' : 
                                             m.mood === 'Focused' ? '🚀' : 
                                             m.mood === 'Calm' ? '☕' : 
                                             m.mood === 'Anxious' ? '⚡' : 
                                             m.mood === 'Sad' ? '😢' : '😐'}
                                        </div>
                                    </Tooltip>
                                ))}
                             </div>
                             <Text type="secondary" className="block text-center mt-2 text-xs">Last 5 entries</Text>
                        </Card>
                    )}
                </div>
            </Col>

            {/* Right Column */}
            <Col xs={24} md={16}>
                <div className="flex flex-col gap-6">
                    {config.visibleSections.mindmap && (
                        <Card title="Mind Map" className="shadow-sm bg-white/90" styles={{ body: { padding: 0 } }}>
                            <MindMap data={graphData} />
                        </Card>
                    )}
                    
                    {config.visibleSections.mbti && profile.mbti && (
                         <Card title="Cognitive Style" className="shadow-sm bg-white/90">
                             <Row gutter={16}>
                                 <Col span={12}>
                                     <Statistic title="MBTI Type" value={profile.mbti.type} valueStyle={{ color: '#8B5CF6' }} />
                                 </Col>
                                 {profile.motivations && (
                                     <Col span={12}>
                                         <Statistic 
                                            title="Core Drive" 
                                            value={Object.entries(profile.motivations).sort(([,a], [,b]) => b - a)[0][0]} 
                                            valueStyle={{ color: '#F472B6', textTransform: 'capitalize' }} 
                                         />
                                     </Col>
                                 )}
                             </Row>
                         </Card>
                    )}
                </div>
            </Col>
        </Row>
        
        {/* Privacy Disclaimer Footer */}
        <Card className="mt-10 bg-gray-50/90 border border-gray-200">
            <div className="text-center">
                <Text type="secondary" className="text-sm block mb-2">
                    🔒 <strong>Privacy & Data Control</strong>
                </Text>
                <Text type="secondary" className="text-xs block mb-3">
                    This profile is publicly shared by the user. All data displayed here is voluntarily shared. 
                    BrainMirror uses AI to analyze patterns but never sells personal data.
                </Text>
                <div className="flex justify-center gap-4 text-xs">
                    <Button type="link" size="small" href="/privacy">Privacy Policy</Button>
                    <Button type="link" size="small" href="/">Create Your Own Profile</Button>
                </div>
                <Text type="secondary" className="text-xs block mt-3">
                    Analysis powered by BrainMirror AI
                </Text>
            </div>
        </Card>
      </div>
    </VantaBackground>
  );
};

export default PublicProfilePage;

