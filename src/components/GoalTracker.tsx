'use client';

import React, { useState } from 'react';
import { Card, Typography, Progress, Button, Modal, Input, Tooltip } from 'antd';
import { TrophyOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { UserProfile, saveUserProfile } from '@/lib/firestoreUtils';
import InfoTooltip from './InfoTooltip';

const { Text, Title } = Typography;

interface GoalTrackerProps {
  userUid: string;
  goals?: string[]; // Simple list of goals for now
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ userUid, goals = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [currentGoals, setCurrentGoals] = useState<string[]>(goals);

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    const updatedGoals = [...currentGoals, newGoal];
    setCurrentGoals(updatedGoals);
    await saveUserProfile(userUid, { goals: updatedGoals });
    setNewGoal('');
    setIsModalOpen(false);
  };

  // Placeholder for progress tracking - in a real app, this would be tied to specific metrics
  const progress = 35; 

  return (
    <Card className="shadow-sm h-full" title={<div className="flex items-center"><TrophyOutlined className="mr-2 text-yellow-500" /> Goals <InfoTooltip text="Track your primary objectives." /></div>}>
       {currentGoals.length === 0 ? (
         <div className="text-center text-gray-400 py-4">
            <p className="mb-2">No goals set yet.</p>
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Set a Goal</Button>
         </div>
       ) : (
         <div className="space-y-4">
            {currentGoals.map((goal, idx) => (
                <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                        <Text strong>{goal}</Text>
                        <Text type="secondary" className="text-xs">{progress}%</Text>
                    </div>
                    <Progress percent={progress} size="small" status="active" strokeColor="#FBBF24" />
                </div>
            ))}
            <Button type="text" size="small" icon={<PlusOutlined />} block onClick={() => setIsModalOpen(true)} className="mt-2 text-gray-400">
                Add Another
            </Button>
         </div>
       )}

       <Modal title="Set a New Goal" open={isModalOpen} onOk={handleAddGoal} onCancel={() => setIsModalOpen(false)}>
          <Input 
            placeholder="e.g., Reduce anxiety, Read 5 books..." 
            value={newGoal} 
            onChange={(e) => setNewGoal(e.target.value)} 
            onPressEnter={handleAddGoal}
          />
       </Modal>
    </Card>
  );
};

export default GoalTracker;

