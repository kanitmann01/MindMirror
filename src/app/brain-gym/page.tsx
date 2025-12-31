'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Modal, App, message, List, Card, Tag } from 'antd';
import { RocketOutlined, ThunderboltOutlined, ExperimentOutlined, HistoryOutlined } from '@ant-design/icons';
import NeuroInterventionCard from '@/components/NeuroInterventionCard';
import DualNBack from '@/components/brain-gym/DualNBack';
import StroopTest from '@/components/brain-gym/StroopTest';
import { GameResult, DualNBackResult, StroopTestResult } from '@/types/brainGym';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, saveUserProfile, saveGameResult, getGameHistory, BrainGymSession } from '@/lib/firestoreUtils';
import { updateScoresWithGameResult, determineArchetype } from '@/lib/psychologyUtils';

const { Title, Paragraph, Text } = Typography;

export default function BrainGymPage() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState<'dual-n-back' | 'stroop-test' | null>(null);
  const [nLevel, setNLevel] = useState(1); // For Dual N-Back, could be persisted
  const [history, setHistory] = useState<BrainGymSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load History
  useEffect(() => {
    if (user) {
        getGameHistory(user.uid).then(data => {
            setHistory(data);
            setLoadingHistory(false);
        });
    }
  }, [user]);

  const handleGameComplete = async (result: GameResult) => {
    setActiveGame(null);
    if (!user) return;

    try {
      // 1. Fetch current profile
      const profile = await getUserProfile(user.uid);
      if (!profile || !profile.oceanScore) {
        message.error("Profile not found. Please complete the quiz first.");
        return;
      }

      // 2. Update Scores
      const newScores = updateScoresWithGameResult(profile.oceanScore, result);
      const newArchetype = determineArchetype(newScores);

      // 3. Save to Firestore (Profile & History)
      await Promise.all([
          saveUserProfile(user.uid, {
            oceanScore: newScores,
            archetype: newArchetype
          }),
          saveGameResult(user.uid, result)
      ]);

      // Update local history state immediately
      const newSession: BrainGymSession = { ...result, createdAt: result.timestamp };
      setHistory(prev => [newSession, ...prev]);

      // 4. Feedback
      Modal.success({
        title: 'Session Complete!',
        content: (
          <div>
            <p>Your neural pathways have been strengthened.</p>
            {result.gameId === 'dual-n-back' && (
                <p>Accuracy: {(result as DualNBackResult).accuracy}% at Level {(result as DualNBackResult).nLevel}</p>
            )}
            {result.gameId === 'stroop-test' && (
                <p>Error Rate: {(result as StroopTestResult).errorRate.toFixed(1)}%</p>
            )}
            <p>Personality profile updated.</p>
          </div>
        ),
      });

      // Update local n-back level if passed
      if (result.gameId === 'dual-n-back') {
          const r = result as DualNBackResult;
          if (r.accuracy > 90) {
              setNLevel(prev => prev + 1);
              message.success("Level Up! N-Back difficulty increased.");
          }
      }

    } catch (error) {
      console.error(error);
      message.error("Failed to save progress.");
    }
  };

  const renderHistoryItem = (item: BrainGymSession) => {
      const date = new Date(item.createdAt || '').toLocaleDateString();
      let details = '';
      let color = 'blue';

      if (item.gameId === 'dual-n-back') {
          const r = item as DualNBackResult;
          details = `Level ${r.nLevel} • ${r.accuracy}% Accuracy`;
          color = 'purple';
      } else if (item.gameId === 'stroop-test') {
          const r = item as StroopTestResult;
          details = `${r.errorRate.toFixed(1)}% Errors • ${Math.round(r.avgReactionTimeMs)}ms RT`;
          color = 'red';
      }

      return (
          <List.Item>
              <List.Item.Meta 
                avatar={item.gameId === 'dual-n-back' ? <ExperimentOutlined style={{ color: '#722ed1' }} /> : <ThunderboltOutlined style={{ color: '#f5222d' }} />}
                title={<span className="capitalize">{item.gameId.replace('-', ' ')}</span>}
                description={date}
              />
              <div className="flex flex-col items-end">
                  <Tag color={color}>{details}</Tag>
                  <Text type="secondary" style={{ fontSize: '10px' }}>{Math.round(item.durationSeconds)}s</Text>
              </div>
          </List.Item>
      );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {!activeGame && (
        <>
          <div className="mb-8">
            <Title level={2}>Brain Gym</Title>
            <Paragraph className="text-lg text-gray-500">
              Targeted neuro-interventions to reshape your cognitive architecture.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={16}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                    <NeuroInterventionCard
                        title="Dual N-Back"
                        description="Challenge your Working Memory. Match both visual position and auditory letter n-steps back."
                        duration="2-5 min"
                        traits={['Conscientiousness', 'Focus']}
                        difficulty={nLevel > 1 ? 'Medium' : 'Easy'}
                        icon={<ExperimentOutlined />}
                        color="#722ed1" // Purple
                        onStart={() => setActiveGame('dual-n-back')}
                    />
                    </Col>
                    <Col xs={24} lg={12}>
                    <NeuroInterventionCard
                        title="Stroop Test"
                        description="Train your Inhibition Control. Select the ink color, ignore the written word."
                        duration="1 min"
                        traits={['Neuroticism (Low)', 'Impulse Control']}
                        difficulty="Hard"
                        icon={<ThunderboltOutlined />}
                        color="#f5222d" // Red
                        onStart={() => setActiveGame('stroop-test')}
                    />
                    </Col>
                </Row>
            </Col>
            
            {/* History Sidebar */}
            <Col xs={24} md={8}>
                <Card title={<><HistoryOutlined /> Training History</>} className="h-full" bodyStyle={{ padding: '0 12px' }}>
                    <List
                        loading={loadingHistory}
                        dataSource={history}
                        renderItem={renderHistoryItem}
                        size="small"
                        pagination={{ pageSize: 5, size: 'small', simple: true }}
                    />
                </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Game Modal / View */}
      <Modal
        open={!!activeGame}
        footer={null}
        closable={false}
        width="100%"
        style={{ top: 0, padding: 0, maxWidth: '100vw', height: '100vh' }}
        styles={{ body: { height: '100vh', padding: 0, display: 'flex', flexDirection: 'column' } }}
        destroyOnClose
      >
        {activeGame === 'dual-n-back' && (
            <DualNBack 
                nLevel={nLevel} 
                onComplete={handleGameComplete} 
                onExit={() => setActiveGame(null)} 
            />
        )}
        {activeGame === 'stroop-test' && (
            <StroopTest 
                onComplete={handleGameComplete} 
                onExit={() => setActiveGame(null)} 
            />
        )}
      </Modal>
    </div>
  );
}
