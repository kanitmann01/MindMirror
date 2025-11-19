'use client';

import React from 'react';
import { Card, Typography, Row, Col, Progress, Tag, Statistic, List } from 'antd';
import { UserProfile } from '@/lib/firestoreUtils';
import { Radar } from '@ant-design/charts';

const { Title, Text, Paragraph } = Typography;

interface InsightsSectionProps {
  profile: UserProfile;
}

const InsightsSection = ({ profile }: InsightsSectionProps) => {
  if (!profile.mbti && !profile.motivations) return null;

  // Helper to generate narrative for MBTI
  const getMBTINarrative = (type: string) => {
    // Simplified narratives
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

  // Motivations Data for Radar Chart
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
      score: {
        min: 0,
        max: 100,
      },
    },
    area: {
      style: {
        fillOpacity: 0.2,
      },
    },
    color: '#6B7FD7',
  };

  return (
    <div className="space-y-6">
      <Title level={3}>Deep Insights</Title>
      
      <Row gutter={[16, 16]}>
        {/* MBTI Section */}
        {profile.mbti && (
          <Col xs={24} md={12}>
            <Card title="Cognitive Architecture (MBTI-style)" className="h-full shadow-sm">
              <div className="text-center mb-6">
                <Title level={1} className="!mb-0 text-primary">{profile.mbti.type}</Title>
                <Text type="secondary">{getMBTINarrative(profile.mbti.type)}</Text>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Text>Introversion (I)</Text>
                  <Progress percent={Math.round(profile.mbti.breakdown.I)} steps={5} size="small" strokeColor="#8B5CF6" showInfo={false} className="w-32" />
                  <Progress percent={Math.round(profile.mbti.breakdown.E)} steps={5} size="small" strokeColor="#F59E0B" showInfo={false} className="w-32 transform rotate-180" />
                  <Text>Extraversion (E)</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text>Sensing (S)</Text>
                   <div className="flex-1 mx-4 flex gap-1">
                      <div className="h-2 bg-blue-200 rounded-l flex-1 overflow-hidden relative">
                         <div style={{ width: `${profile.mbti.breakdown.S}%` }} className="h-full bg-blue-500 absolute right-0"></div>
                      </div>
                      <div className="h-2 bg-purple-200 rounded-r flex-1 overflow-hidden relative">
                         <div style={{ width: `${profile.mbti.breakdown.N}%` }} className="h-full bg-purple-500 absolute left-0"></div>
                      </div>
                   </div>
                  <Text>Intuition (N)</Text>
                </div>
                 {/* Simplified bars for the rest */}
                 <div className="flex justify-between text-xs text-gray-500">
                    <span>Thinking ({Math.round(profile.mbti.breakdown.T)}%)</span>
                    <span>Feeling ({Math.round(profile.mbti.breakdown.F)}%)</span>
                 </div>
                 <Progress percent={profile.mbti.breakdown.F} success={{ percent: 0 }} strokeColor="#EC4899" trailColor="#3B82F6" showInfo={false} />
                 
                 <div className="flex justify-between text-xs text-gray-500">
                    <span>Judging ({Math.round(profile.mbti.breakdown.J)}%)</span>
                    <span>Perceiving ({Math.round(profile.mbti.breakdown.P)}%)</span>
                 </div>
                 <Progress percent={profile.mbti.breakdown.P} success={{ percent: 0 }} strokeColor="#10B981" trailColor="#6366F1" showInfo={false} />
              </div>
            </Card>
          </Col>
        )}

        {/* Motivations Section */}
        {profile.motivations && (
          <Col xs={24} md={12}>
            <Card title="Core Motivations" className="h-full shadow-sm">
               <div style={{ height: 250 }}>
                 <Radar {...radarConfig} />
               </div>
               <div className="mt-4">
                 <Text strong>Dominant Drive: </Text>
                 <Tag color="blue">{motivationData.sort((a,b) => b.score - a.score)[0]?.item}</Tag>
               </div>
            </Card>
          </Col>
        )}

        {/* Cognitive Style */}
        {profile.cognitiveStyle && (
          <Col xs={24}>
             <Card title="Cognitive Style" className="shadow-sm">
                <Row gutter={24}>
                   <Col span={12}>
                      <Statistic title="Thinking Style" value={profile.cognitiveStyle.analytical > profile.cognitiveStyle.creative ? 'Analytical' : 'Creative'} />
                      <Progress percent={profile.cognitiveStyle.creative} format={() => 'Creativity'} strokeColor="cyan" />
                   </Col>
                   <Col span={12}>
                      <Statistic title="Decision Speed" value={profile.cognitiveStyle.fast > profile.cognitiveStyle.deliberative ? 'Instinctive' : 'Deliberative'} />
                      <Progress percent={profile.cognitiveStyle.deliberative} format={() => 'Deliberation'} strokeColor="orange" />
                   </Col>
                </Row>
             </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default InsightsSection;

