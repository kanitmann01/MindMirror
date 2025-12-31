import React from 'react';
import { Card, Button, Tag, Typography } from 'antd';
import { PlayCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface NeuroInterventionCardProps {
  title: string;
  description: string;
  duration: string;
  traits: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  onStart: () => void;
  icon?: React.ReactNode;
  color?: string; // Hex color for header/accents
}

const NeuroInterventionCard: React.FC<NeuroInterventionCardProps> = ({
  title,
  description,
  duration,
  traits,
  difficulty,
  onStart,
  icon,
  color = '#1890ff',
}) => {
  return (
    <Card
      hoverable
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        borderTop: `4px solid ${color}`
      }}
      bodyStyle={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-full text-2xl"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {icon || <TrophyOutlined />}
        </div>
        <div>
          <Title level={4} style={{ margin: 0 }}>{title}</Title>
          <div className="flex gap-2 text-xs text-gray-500">
             <span className="flex items-center gap-1"><ClockCircleOutlined /> {duration}</span>
             <span>•</span>
             <span>{difficulty}</span>
          </div>
        </div>
      </div>

      <Paragraph type="secondary" className="flex-grow mb-4">
        {description}
      </Paragraph>

      <div className="mb-6">
        <Text strong className="text-xs uppercase text-gray-400 block mb-2">Targeted Traits</Text>
        <div className="flex flex-wrap gap-1">
          {traits && traits.map(t => (
            <Tag key={t} color="blue" style={{ borderRadius: '12px' }}>{t}</Tag>
          ))}
        </div>
      </div>

      <Button 
        type="primary" 
        size="large" 
        block 
        icon={<PlayCircleOutlined />}
        onClick={onStart}
        style={{ marginTop: 'auto', backgroundColor: color, borderColor: color }}
      >
        Start Session
      </Button>
    </Card>
  );
};

export default NeuroInterventionCard;
