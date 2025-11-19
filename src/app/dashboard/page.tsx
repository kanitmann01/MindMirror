'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Tag, Spin, Button } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, getMediaItems, UserProfile, MediaItem } from '@/lib/firestoreUtils';
import MindMap from '@/components/MindMap';
import MoodTracker from '@/components/MoodTracker';
import InsightsSection from '@/components/InsightsSection';
import { transformToGraphData } from '@/lib/graphUtils';
import { useRouter } from 'next/navigation';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          const [p, m] = await Promise.all([
            getUserProfile(user.uid),
            getMediaItems(user.uid)
          ]);
          setProfile(p);
          setMedia(m);
        } catch (e) {
          console.error(e);
        } finally {
          setFetching(false);
        }
      };
      fetchData();
    }
  }, [user, loading, router]);

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
    <div className="space-y-6"> {/* Added vertical spacing container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Title level={2} style={{ margin: 0 }}>Your BrainMirror</Title>
        <div className="flex flex-wrap gap-3">
          {!showDeepInsights && (
             <Button type="dashed" icon={<ThunderboltOutlined />} onClick={() => router.push('/onboarding')}>
               Unlock Deep Insights
             </Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/add-media')}>
            Add Media
          </Button>
        </div>
      </div>
      
      <Row gutter={[24, 24]}>
        {/* Archetype Card */}
        <Col xs={24} md={8}>
           <div className="flex flex-col gap-6 h-full"> {/* Changed to flex-col with explicit gap */}
             <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ borderTop: `4px solid ${profile.archetype?.color || '#6B7FD7'}` }}>
               <Title level={3}>{profile.archetype?.name}</Title>
               <Paragraph>{profile.archetype?.description}</Paragraph>
               <div className="mb-4 flex flex-wrap gap-2">
                 {profile.archetype?.traits.map(t => (
                   <Tag key={t} color="blue">{t}</Tag>
                 ))}
               </div>
               {/* Tiny OCEAN Stats */}
               <div className="space-y-2">
                  {profile.oceanScore && Object.entries(profile.oceanScore).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-600">{k}</span>
                      <span className="font-bold text-gray-800">{v}</span>
                    </div>
                  ))}
               </div>
             </Card>
             
             {/* Mood Tracker */}
             <MoodTracker />
           </div>
        </Col>

        {/* Mind Map & Insights */}
        <Col xs={24} md={16}>
           <div className="flex flex-col gap-6">
             <Card className="shadow-sm" title="Mind Map" bodyStyle={{ padding: 0 }}> {/* Removed default padding to let graph fill */}
               <MindMap data={graphData} />
             </Card>
             
             {/* Deep Insights Section */}
             {showDeepInsights ? (
               <InsightsSection profile={profile} />
             ) : (
               <Card className="text-center py-10 bg-gray-50 border-dashed border-2">
                  <Title level={4}>Dig Deeper</Title>
                  <Paragraph className="max-w-md mx-auto mb-6">
                    Your profile currently only scratches the surface. Unlock cognitive style analysis, motivation mapping, and detailed personality insights.
                  </Paragraph>
                  <Button type="primary" onClick={() => router.push('/onboarding')}>
                    Take Deep Dive Assessment
                  </Button>
               </Card>
             )}
           </div>
        </Col>
      </Row>

      {/* Recent Media List (Simple) */}
      <Row className="mt-8">
        <Col span={24}>
           <Card title="Recent Inputs">
             {media.length === 0 ? (
               <p className="text-gray-400">No media added yet. Start adding to see your map grow!</p>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                 {media.slice(0, 6).map((item: MediaItem) => (
                   <div key={item.id} className="p-3 border rounded bg-gray-50 flex justify-between items-center">
                      <div>
                        <div className="font-bold">{item.title}</div>
                        <div className="text-xs text-gray-500 capitalize">{item.category}</div>
                      </div>
                      <Tag color={item.rating >= 4 ? 'green' : 'orange'}>{item.rating}</Tag>
                   </div>
                 ))}
               </div>
             )}
           </Card>
        </Col>
      </Row>
    </div>
  );
}
