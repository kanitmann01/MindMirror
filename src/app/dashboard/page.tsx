'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Card, Row, Col, Tag, Spin, Button, FloatButton, Grid } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, getMediaItems, UserProfile, MediaItem } from '@/lib/firestoreUtils';
import MindMap from '@/components/MindMap';
import MoodTracker from '@/components/MoodTracker';
import InsightsSection from '@/components/InsightsSection';
import { transformToGraphData } from '@/lib/graphUtils';
import { useRouter } from 'next/navigation';
import { PlusOutlined, ThunderboltOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons';
import InfoTooltip from '@/components/InfoTooltip';

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const screens = useBreakpoint();

  // Function to refresh data locally without full reload
  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      // We can optimize this to only fetch what changed, but for now fetching all ensures consistency
      const [p, m] = await Promise.all([
        getUserProfile(user.uid),
        getMediaItems(user.uid)
      ]);
      setProfile(p);
      setMedia(m);
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      const initFetch = async () => {
        setFetching(true);
        await refreshData();
        setFetching(false);
      };
      initFetch();
    }
  }, [user, loading, router, refreshData]);

  if (loading || fetching) return <div className="flex justify-center items-center h-full"><Spin size="large" /></div>;

  if (!profile) return (
     <div className="text-center mt-20">
        <Title level={3}>Profile Not Found</Title>
        <Button type="primary" onClick={() => router.push('/onboarding')}>Complete Onboarding</Button>
     </div>
  );

  const graphData = transformToGraphData(profile, media);
  const showDeepInsights = profile.mbti && profile.motivations;

  return (
    <div className="space-y-6 pb-20 md:pb-0"> 
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
             <Title level={2} style={{ margin: 0 }}>Your BrainMirror</Title>
             <Typography.Text type="secondary">Visualize your mind, track your growth.</Typography.Text>
        </div>
        <div className="hidden md:flex flex-wrap gap-3">
          {!showDeepInsights && (
             <Button type="dashed" icon={<ThunderboltOutlined />} onClick={() => router.push('/onboarding')}>
               Unlock Deep Insights
             </Button>
          )}
          <Button icon={<UserOutlined />} onClick={() => router.push('/settings/public-profile')}>
            Public Profile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/add-media')}>
            Add Media
          </Button>
        </div>
      </div>
      
      {/* Mobile FABs for Quick Actions */}
      {!screens.md && (
        <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24 }}>
            <FloatButton icon={<PlusOutlined />} type="primary" onClick={() => router.push('/add-media')} />
            <FloatButton icon={<SmileOutlined />} onClick={() => document.getElementById('mood-tracker-card')?.scrollIntoView({ behavior: 'smooth' })} />
        </FloatButton.Group>
      )}

      <Row gutter={[24, 24]}>
        {/* Left Column: Profile & Mood */}
        <Col xs={24} md={8}>
           <div className="flex flex-col gap-6 h-full">
             {/* Archetype Summary */}
             <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ borderTop: `4px solid ${profile.archetype?.color || '#6B7FD7'}` }}>
               <div className="flex justify-between items-start">
                   <Title level={3} className="!mb-1">{profile.archetype?.name}</Title>
                   <InfoTooltip text="Your dominant personality archetype based on OCEAN scores." />
               </div>
               <Paragraph type="secondary" className="text-sm mb-4">{profile.archetype?.description}</Paragraph>
               
               <div className="mb-6 flex flex-wrap gap-2">
                 {profile.archetype?.traits.map(t => (
                   <Tag key={t} color="blue">{t}</Tag>
                 ))}
               </div>
               
               {/* Tiny OCEAN Stats */}
               <div className="space-y-3">
                  <div className="flex items-center mb-2">
                      <Typography.Text strong className="text-xs uppercase text-gray-400">OCEAN Profile</Typography.Text>
                      <InfoTooltip text="Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism" />
                  </div>
                  {profile.oceanScore && Object.entries(profile.oceanScore).map(([k, v]) => (
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
             
             {/* Mood Tracker */}
             <div id="mood-tracker-card">
                <MoodTracker onMoodLogged={refreshData} />
             </div>
           </div>
        </Col>

        {/* Right Column: Visualization & Insights */}
        <Col xs={24} md={16}>
           <div className="flex flex-col gap-6">
             {/* Mind Map */}
             <Card 
                className="shadow-sm" 
                title={<div className="flex items-center">Mind Map <InfoTooltip text="A visual graph of your personality traits, media consumption, and their psychological connections." /></div>}
                styles={{ body: { padding: 0 } }}
             > 
               <MindMap data={graphData} />
             </Card>
             
             {/* Recent Inputs (Moved up for better flow) */}
             <Card title="Recent Inputs" extra={<Button type="link" size="small" onClick={() => router.push('/add-media')}>View All</Button>}>
                {media.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded border border-dashed">
                      <p className="text-gray-400 mb-2">No media added yet.</p>
                      <Button size="small" icon={<PlusOutlined />} onClick={() => router.push('/add-media')}>Add First Item</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {media.slice(0, 6).map((item: MediaItem) => (
                      <div key={item.id} className="p-3 border rounded bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors">
                         <div className="truncate pr-2">
                           <div className="font-medium truncate text-sm" title={item.title}>{item.title}</div>
                           <div className="text-[10px] text-gray-500 capitalize">{item.category}</div>
                         </div>
                         <Tag color={item.rating >= 4 ? 'green' : 'orange'} className="mr-0">{item.rating}</Tag>
                      </div>
                    ))}
                  </div>
                )}
             </Card>

             {/* Deep Insights Section */}
             {showDeepInsights ? (
               <InsightsSection profile={profile} media={media} /> 
             ) : (
               <Card className="text-center py-10 bg-gradient-to-r from-indigo-50 to-purple-50 border-dashed border-2 border-indigo-100">
                  <Title level={4} className="!text-indigo-900">Unlock Deep Insights</Title>
                  <Paragraph className="max-w-md mx-auto mb-6 text-indigo-700">
                    Go beyond the basics. Unlock cognitive style analysis, motivation mapping, and detailed personality insights by completing the full assessment.
                  </Paragraph>
                  <Button type="primary" size="large" icon={<ThunderboltOutlined />} onClick={() => router.push('/onboarding')}>
                    Take Deep Dive Assessment
                  </Button>
               </Card>
             )}
           </div>
        </Col>
      </Row>
    </div>
  );
}
