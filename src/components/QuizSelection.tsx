import React from 'react';
import { Card, Row, Col, Typography, Badge, Button } from 'antd';
import { ThunderboltOutlined, ExperimentOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface QuizSelectionProps {
  onSelect: (type: 'quick' | 'deep') => void;
}

const QuizSelection: React.FC<QuizSelectionProps> = ({ onSelect }) => {
  // Access router via hook inside the component, assuming Next.js environment
  // Note: We need to be careful about where this is used. It's used in QuizPage which is client side.
  // But QuizSelection itself doesn't have access to router unless we pass it or use the hook.
  // Let's use window.location for simplicity if router isn't available prop, or just use href
  // Actually, easier to just add a prop or simple link.
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 relative">
      <div className="absolute top-4 right-4">
        <Button type="text" href="/dashboard">Exit to Dashboard</Button>
      </div>
      <div className="text-center mb-12">
        <Title level={2} className="mb-4">Choose Your Depth</Title>
        <Paragraph className="text-lg text-gray-500">
          Select how you want to build your MindMirror profile.
        </Paragraph>
      </div>

      <Row gutter={[32, 32]} justify="center">
        {/* Option A: Quick Calibration */}
        <Col xs={24} md={12}>
          <Card 
            hoverable 
            className="h-full border-2 border-transparent hover:border-blue-100 transition-all"
            onClick={() => onSelect('quick')}
          >
            <div className="flex flex-col h-full p-4">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500 text-3xl">
                  <ThunderboltOutlined />
                </div>
                <Title level={3} className="mb-2">Quick Calibration</Title>
                <Text type="secondary" className="block mb-4 font-medium">1 Minute • 10 Dimensions</Text>
                <Paragraph className="text-gray-600 mb-6">
                  Broad-strokes baseline. Good for casual tracking and getting started immediately.
                </Paragraph>
              </div>
              <div className="mt-auto">
                <Button type="primary" block size="large" icon={<ArrowRightOutlined />}>
                  Start Quick
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        {/* Option B: Deep Resonance */}
        <Col xs={24} md={12}>
          <Badge.Ribbon text="Recommended" color="purple">
            <Card 
              hoverable 
              className="h-full border-2 border-purple-50 hover:border-purple-100 transition-all"
              onClick={() => onSelect('deep')}
            >
              <div className="flex flex-col h-full p-4">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-500 text-3xl">
                    <ExperimentOutlined />
                  </div>
                  <Title level={3} className="mb-2">Deep Resonance</Title>
                  <Text type="secondary" className="block mb-4 font-medium">4 Minutes • 25 Dimensions</Text>
                  <Paragraph className="text-gray-600 mb-6">
                    High-precision psychometrics based on IPIP-NEO. Unlocks granular insights and richer recommendations.
                  </Paragraph>
                </div>
                <div className="mt-auto">
                  <Button className="bg-purple-600 hover:bg-purple-500 text-white border-none" block size="large" icon={<ArrowRightOutlined />}>
                    Start Deep
                  </Button>
                </div>
              </div>
            </Card>
          </Badge.Ribbon>
        </Col>
      </Row>
    </div>
  );
};

export default QuizSelection;

