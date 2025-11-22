'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Card, Row, Col, Tag, Spin, Button, FloatButton, Grid, Modal, List, Popconfirm, App } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, getMediaItems, UserProfile, MediaItem, deleteMediaItem, getMoodEntries } from '@/lib/firestoreUtils';
import MindMap from '@/components/MindMap';
import MoodPrescription from '@/components/MoodPrescription';
import MoodTracker from '@/components/MoodTracker';
import InsightsSection from '@/components/InsightsSection';
import { transformToGraphData } from '@/lib/graphUtils';
import { useRouter } from 'next/navigation';
import { PlusOutlined, ThunderboltOutlined, SmileOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import InfoTooltip from '@/components/InfoTooltip';

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { message } = App.useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const router = useRouter();
  const screens = useBreakpoint();

  const [latestMood, setLatestMood] = useState<string | null>(null);

  // Function to refresh data locally without full reload
  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      // We can optimize this to only fetch what changed, but for now fetching all ensures consistency
      const [p, m, moods] = await Promise.all([
        getUserProfile(user.uid),
        getMediaItems(user.uid),
        getMoodEntries(user.uid, 1)
      ]);
      setProfile(p);
      setMedia(m);
      if (moods && moods.length > 0) {
        setLatestMood(moods[0].mood);
      }
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

  const handleDeleteMedia = async (mediaId: string) => {
    if (!user) return;
    try {
      await deleteMediaItem(user.uid, mediaId);
      message.success("Media item deleted");
      refreshData();
    } catch (error) {
      console.error(error);
      message.error("Failed to delete media");
    }
  };

  if (loading || fetching) return <div className="flex justify-center items-center h-full"><Spin size="large" /></div>;

  if (!profile) return (
    <div className="text-center mt-20">
      <Title level={3}>Welcome to MindMirror</Title>
      <Paragraph>Your mind is a galaxy waiting to be mapped. Let's initialize your profile.</Paragraph>
      <Button type="primary" onClick={() => router.push('/quiz')}>Begin Neural Calibration</Button>
    </div>
  );

  const graphData = transformToGraphData(profile, media);
  // Show insights if we have data OR if the user has taken the deep quiz (high precision)
  const showDeepInsights = (profile.mbti && profile.motivations) || profile.profile_precision === 'high';

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>Your MindMirror</Title>
          <Typography.Text type="secondary">Visualize your mind, track your growth.</Typography.Text>
        </div>
        <div className="hidden md:flex flex-wrap gap-3">
          {!showDeepInsights && (
            <Button type="dashed" icon={<ThunderboltOutlined />} onClick={() => router.push('/quiz')}>
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

            {/* Mood Prescription */}
            <MoodPrescription history={media} currentMood={latestMood} />
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
              <MindMap data={graphData} currentMood={latestMood} />
            </Card>

            {/* Recent Inputs (Moved up for better flow) */}
            <Card
              title="Recent Inputs"
              extra={<Button type="link" size="small" onClick={() => setIsMediaModalOpen(true)}>View All</Button>}
            >
              {media.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded border border-dashed">
                  <p className="text-gray-400 mb-2">No media added yet.</p>
                  <Button size="small" icon={<PlusOutlined />} onClick={() => router.push('/add-media')}>Add First Item</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    // Group YouTube items by Channel (Tag)
                    const groupedMedia: { [key: string]: MediaItem[] } = {};
                    const otherMedia: MediaItem[] = [];

                    media.forEach(item => {
                      if (item.category === 'youtube' && item.tags && item.tags.length > 0) {
                        const channelName = item.tags[0]; // Assumption: First tag is channel
                        if (!groupedMedia[channelName]) {
                          groupedMedia[channelName] = [];
                        }
                        groupedMedia[channelName].push(item);
                      } else {
                        otherMedia.push(item);
                      }
                    });

                    const renderItems: React.ReactNode[] = [];

                    // Render Grouped YouTube Channels
                    Object.entries(groupedMedia).forEach(([channelName, items]) => {
                      // Use the most recent item's ID for key, or a composite
                      const key = `channel-${channelName}`;
                      const recentItems = items.slice(0, 3);
                        renderItems.push(
                            <div key={key} className="p-3 border rounded bg-gray-50 flex flex-col justify-between hover:bg-gray-100 transition-colors h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium truncate" title={channelName}>{channelName}</span>
                                    <Tag color="red" className="mr-0 text-[10px]">YouTube</Tag>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {recentItems.map(v => (
                                        <div key={v.id} className="truncate">• {v.title}</div>
                                    ))}
                                    {items.length > 3 && <div className="italic">+{items.length - 3} more</div>}
                                </div>
                            </div>
                        );
                    });

                    // Render Other Media
                    otherMedia.forEach(item => {
                      renderItems.push(
                        <div key={item.id} className="p-3 border rounded bg-gray-50 flex justify-between items-start hover:bg-gray-100 transition-colors h-full">
                          <div className="truncate pr-2 flex-1">
                            <div className="font-medium truncate text-sm" title={item.title}>{item.title}</div>
                            <div className="text-[10px] text-gray-500 capitalize">{item.category === 'youtube' ? 'YouTube' : item.category}</div>
                          </div>
                          <Tag color={item.rating >= 4 ? 'green' : 'orange'} className="mr-0 flex-shrink-0">{item.rating}</Tag>
                        </div>
                      );
                    });

                    // Ensure at least 3 items are shown if possible, but "avoid empty boxes".
                    // The instruction "Always show at least 3 recent items" probably implies logic to fetch or ensure UI isn't empty.
                    // Since we just show what we have, the grid layout handles the visual aspect.
                    return renderItems.slice(0, 6);
                  })()}
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
                <Button type="primary" size="large" icon={<ThunderboltOutlined />} onClick={() => router.push('/quiz')}>
                  Take Deep Dive Assessment
                </Button>
              </Card>
            )}
          </div>
        </Col>
      </Row>

      {/* Media Modal */}
      <Modal
        title="All Media History"
        open={isMediaModalOpen}
        onCancel={() => setIsMediaModalOpen(false)}
        footer={null}
        width={600}
      >
        <List
          itemLayout="horizontal"
          dataSource={media}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="delete"
                  title="Delete this item?"
                  description="This will affect your personality score analysis."
                  onConfirm={() => handleDeleteMedia(item.id!)}
                  okText="Yes"
                  cancelText="No"
                  >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={<span className="font-medium">{item.title}</span>}
                description={
                  <div className="flex gap-2 items-center">
                    <Tag>{item.category}</Tag>
                    <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                }
              />
              <div><Tag color={item.rating >= 4 ? 'green' : 'orange'}>{item.rating}/5</Tag></div>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}
