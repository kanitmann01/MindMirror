'use client';

import React, { useState } from 'react';
import { Card, Typography, Row, Col, Progress, Tag, Statistic, Button, Spin, App, Modal, Tooltip, Badge, Alert } from 'antd';
import { UserProfile, MediaItem, saveUserProfile } from '@/lib/firestoreUtils';
import { determineArchetype } from '@/lib/psychologyUtils';
import { Radar } from '@ant-design/charts';
import { RobotOutlined, StarOutlined, QuestionCircleOutlined, BulbOutlined, CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import InfoTooltip from './InfoTooltip';
import { useAuth } from '@/context/AuthContext';

const { Title, Text, Paragraph } = Typography;

interface InsightsSectionProps {
  profile: UserProfile;
  media?: MediaItem[];
}

const InsightsSection = ({ profile, media = [] }: InsightsSectionProps) => {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [aiData, setAiData] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [methodologyVisible, setMethodologyVisible] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // if (!profile.mbti && !profile.motivations) return null; // Removed to allow AI access

  // --- Load initial AI data from profile if available ---
  // This prevents "refreshing" on every render and provides persistence.
  React.useEffect(() => {
    if (profile?.aiInsights) {
        setAiData(profile.aiInsights);
    }
  }, [profile]);

  const generateAiInsight = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/analyze-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, media }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAiData(data.structured);

      // Automatically save the FULL AI data to Firestore for persistence
      if (user) {
        await saveUserProfile(user.uid, {
          aiInsights: data.structured,
          narrative_summary: data.structured.narrative_summary // Keep this for lightweight access if needed
        });
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message || 'Failed to contact the oracle.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleApplyCalibration = async () => {
    if (!user || !aiData?.updated_scores) return;
    setUpdatingProfile(true);
    try {
      const newScores = aiData.updated_scores;
      const newArchetype = determineArchetype(newScores);

      await saveUserProfile(user.uid, {
        oceanScore: newScores,
        archetype: newArchetype
      });

      message.success('Profile calibrated with AI insights!');
      setAiData(null); // Reset to force refresh or just let parent refresh happen? 
      // Parent refresh is automatic if we used a callback, but here we might need to rely on parent re-render.
      // ideally we reload the page or trigger a callback. 
      window.location.reload(); // Simple brute force for now to ensure charts update
    } catch (error) {
      console.error(error);
      message.error('Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Calculate basic confidence score based on media count
  const confidenceScore = media.length < 5 ? 'Low' : media.length < 15 ? 'Medium' : 'High';
  const confidenceColor = media.length < 5 ? 'red' : media.length < 15 ? 'orange' : 'green';

  // Helper to generate narrative for MBTI
  const getMBTINarrative = (type: string) => {
    const narratives: Record<string, string> = {
      'INTJ': 'The Architect: Strategic and conceptual.',
      'INTP': 'The Logician: Innovative and curious.',
      'ENTJ': 'The Commander: Bold and imaginative leader.',
      'ENTP': 'The Debater: Smart and curious thinker.',
      'INFJ': 'The Advocate: Quiet and mystical indefatigable idealist.',
      'INFP': 'The Mediator: Poetic, kind and altruistic.',
      'ENFJ': 'The Protagonist: Charismatic and inspiring leader.',
      'ENFP': 'The Campaigner: Enthusiastic, creative and sociable free spirit.',
      'ISTJ': 'The Logistician: Practical and fact-minded.',
      'ISFJ': 'The Defender: Very dedicated and warm protector.',
      'ESTJ': 'The Executive: Excellent administrator.',
      'ESFJ': 'The Consul: Extraordinarily caring and social.',
      'ISTP': 'The Virtuoso: Bold and practical experimenter.',
      'ISFP': 'The Adventurer: Flexible and charming artist.',
      'ESTP': 'The Entrepreneur: Smart, energetic and very perceptive.',
      'ESFP': 'The Entertainer: Spontaneous, energetic and enthusiastic.',
    };
    return narratives[type] || 'A unique personality blend.';
  };

  const motivationData = profile.motivations ? [
    { item: 'Achievement', score: profile.motivations.achievement },
    { item: 'Curiosity', score: profile.motivations.curiosity },
    { item: 'Sociality', score: profile.motivations.sociality },
    { item: 'Security', score: profile.motivations.security },
    { item: 'Novelty', score: profile.motivations.novelty_seeking },
  ] : [];

  const radarConfig = {
    data: motivationData,
    xField: 'item',
    yField: 'score',
    meta: {
      score: { min: 0, max: 100 },
    },
    area: { style: { fillOpacity: 0.2 } },
    color: '#6B7FD7',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Title level={3} style={{ margin: 0 }}>Deep Insights</Title>
          <Button type="text" icon={<QuestionCircleOutlined />} size="small" onClick={() => setMethodologyVisible(true)}>Methodology</Button>
        </div>
        <Button
          icon={<RobotOutlined />}
          onClick={generateAiInsight}
          loading={loadingAi}
          type={aiData ? 'default' : 'primary'}
          className="shadow-sm"
        >
          {aiData ? 'Refresh AI Analysis' : 'Ask Gemini Oracle'}
        </Button>
      </div>

      {/* AI Insight Card - Dynamic */}
      {aiData ? (
        <Card className="shadow-md border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-transparent">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StarOutlined className="text-purple-600 text-xl" />
              <Title level={4} className="!m-0 text-purple-900">{aiData.taste_dna}</Title>
            </div>

            <div className="relative">
              <Paragraph 
                className="text-base text-gray-700 leading-relaxed whitespace-pre-line"
                style={{ 
                  maxHeight: isTextExpanded ? 'none' : '150px', 
                  overflow: 'hidden',
                  transition: 'max-height 0.5s ease'
                }}
              >
                {aiData.narrative}
              </Paragraph>
              {!isTextExpanded && (
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent flex items-end justify-center">
                   <Button type="link" onClick={() => setIsTextExpanded(true)} size="small">Read Full Analysis</Button>
                </div>
              )}
              {isTextExpanded && (
                 <Button type="link" onClick={() => setIsTextExpanded(false)} size="small" className="pl-0">Show Less</Button>
              )}
            </div>

            <div className="bg-white/60 p-4 rounded-lg border border-purple-100">
              <Text strong className="text-purple-800 block mb-2"><BulbOutlined /> Personalized Growth Paths:</Text>
              {aiData.growth_paths ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {aiData.growth_paths?.map((path: any, idx: number) => (
                      <li key={idx}>
                        <Text strong>{path.title}:</Text> {path.description}
                      </li>
                    ))}
                  </ul>
              ) : (
                  <div className="h-20 flex items-center justify-center">
                       <Spin size="small" />
                  </div>
              )}
            </div>

            {/* Calibration Offer */}
            {aiData.updated_scores && (
              <Alert
                message="AI Profile Calibration Available"
                description={
                  <div className="mt-2">
                    <p className="mb-2">Gemini has analyzed your media history and suggests refining your personality scores for higher accuracy.</p>
                    <Button
                      type="primary"
                      size="small"
                      icon={<ArrowRightOutlined />}
                      onClick={handleApplyCalibration}
                      loading={updatingProfile}
                    >
                      Apply AI Calibration
                    </Button>
                  </div>
                }
                type="info"
                showIcon
                className="border-blue-200 bg-blue-50"
              />
            )}

            <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
              <span>AI Confidence: </span>
              <Progress percent={aiData.confidence_score} size="small" steps={5} strokeColor={aiData.confidence_score > 70 ? 'green' : 'orange'} className="w-24" showInfo={false} />
              <span>{aiData.confidence_score}%</span>
            </div>
          </div>
        </Card>
      ) : (
        /* Placeholder / Prompt Card */
        <Card className="bg-gray-50 border-dashed text-center py-6">
          <div className="flex flex-col items-center gap-2">
            <RobotOutlined className="text-3xl text-gray-400" />
            <Text type="secondary">Unlock a deep, AI-powered psychological narrative generated by Gemini.</Text>
          </div>
        </Card>
      )}

      {/* Data Confidence Banner */}
      <div className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded border border-blue-100 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircleOutlined style={{ color: confidenceColor }} />
          <span>Data Confidence: <strong style={{ color: confidenceColor }}>{confidenceScore}</strong></span>
          <InfoTooltip text={`Based on ${media.length} media items. Add more for higher accuracy.`} />
        </div>
        {confidenceScore !== 'High' && <Text type="secondary" className="hidden sm:inline">Add more media to improve accuracy.</Text>}
      </div>

      <Row gutter={[16, 16]}>
        {/* MBTI Section */}
        {profile.mbti && (
          <Col xs={24} md={12}>
            <Card
              title={
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span>{profile.archetype?.name || 'The User'} ({profile.mbti.type})</span>
                    <InfoTooltip text="Your Cognitive Architecture" />
                  </div>
                  <Text type="secondary" className="text-xs font-normal mt-1">Cognitive Style: {getMBTINarrative(profile.mbti.type)}</Text>
                </div>
              }
              className="h-full shadow-sm"
            >
              <div className="text-center mb-6">
                <Title level={1} className="!mb-0 text-primary">{profile.mbti.type}</Title>
                <Text type="secondary">{getMBTINarrative(profile.mbti.type)}</Text>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Text>Introversion (I)</Text>
                  <Progress percent={Math.round(profile.mbti.breakdown.I)} steps={5} size="small" strokeColor="#8B5CF6" showInfo={false} className="w-24 sm:w-32" />
                  <Progress percent={Math.round(profile.mbti.breakdown.E)} steps={5} size="small" strokeColor="#F59E0B" showInfo={false} className="w-24 sm:w-32 transform rotate-180" />
                  <Text>Extraversion (E)</Text>
                </div>
                {/* ... other MBTI bars (simplified for brevity, assume same structure as before) ... */}
                <div className="flex items-center justify-between">
                  <Text>Sensing (S)</Text>
                  <div className="flex-1 mx-2 sm:mx-4 flex gap-1">
                    <div className="h-2 bg-blue-200 rounded-l flex-1 overflow-hidden relative">
                      <div style={{ width: `${profile.mbti.breakdown.S}%` }} className="h-full bg-blue-500 absolute right-0"></div>
                    </div>
                    <div className="h-2 bg-purple-200 rounded-r flex-1 overflow-hidden relative">
                      <div style={{ width: `${profile.mbti.breakdown.N}%` }} className="h-full bg-purple-500 absolute left-0"></div>
                    </div>
                  </div>
                  <Text>Intuition (N)</Text>
                </div>
              </div>
            </Card>
          </Col>
        )}

        {/* Motivations Section */}
        {profile.motivations && (
          <Col xs={24} md={12}>
            <Card
              title={<div className="flex items-center">Core Motivations <InfoTooltip text="What drives your decisions and interests." /></div>}
              className="h-full shadow-sm"
            >
              <div style={{ height: 250 }}>
                <Radar {...radarConfig} />
              </div>
              <div className="mt-4 text-center">
                <Text type="secondary">Dominant Drive:</Text><br />
                <Tag color="blue" className="text-base py-1 px-3 mt-1">{motivationData.sort((a, b) => b.score - a.score)[0]?.item}</Tag>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      {/* Methodology Modal */}
      <Modal
        title="How MindMirror Calculates Your Profile"
        open={methodologyVisible}
        onCancel={() => setMethodologyVisible(false)}
        footer={null}
      >
        <div className="space-y-4 text-gray-700">
          <Paragraph>
            MindMirror combines <strong>established psychological frameworks</strong> with <strong>behavioral data analysis</strong>.
          </Paragraph>
          <div>
            <Text strong>1. OCEAN Model (Big Five)</Text>
            <Paragraph className="text-sm">
              We calculate your Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism scores based on your initial quiz and refine them as you add media. (e.g., Documentaries increase Openness).
            </Paragraph>
          </div>
          <div>
            <Text strong>2. Jungian Archetypes</Text>
            <Paragraph className="text-sm">
              We map your dominant OCEAN traits to one of 5 core archetypes (Explorer, Creator, Diplomat, etc.) to give you a high-level identity.
            </Paragraph>
          </div>
          <div>
            <Text strong>3. Gemini AI Synthesis</Text>
            <Paragraph className="text-sm">
              Our AI engine analyzes the <em>semantic meaning</em> of your media titles and mood notes to find subtle patterns that raw numbers miss, providing the "Taste DNA" narrative.
            </Paragraph>
          </div>
          <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
            <strong>Privacy Note:</strong> All analysis happens securely. Your data is never sold. AI insights are generated on-demand and are estimates based on available data.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InsightsSection;
