'use client';

import React, { useEffect } from 'react';
import { Button, Typography, Card, Row, Col, Space } from 'antd';
import { RocketOutlined, BulbOutlined, HeartOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import VantaBackground from '@/components/VantaBackground';

const { Title, Paragraph } = Typography;

export default function LandingPage() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleGetStarted = async () => {
    if (user) {
      router.push('/dashboard');
    } else {
      await signInWithGoogle();
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);


  return (
    <VantaBackground>
      <div className="min-h-screen flex flex-col relative z-10">
        {/* Navbar */}
        <header className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
          <div className="text-2xl font-bold text-indigo-600">BrainMirror</div>
          <Space>
            {user ? (
               <Button type="primary" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            ) : (
               <Button type="primary" onClick={signInWithGoogle}>Login</Button>
            )}
          </Space>
        </header>

        {/* Hero */}
        <section className="text-center py-12 px-4 md:py-20 flex-1 flex flex-col justify-center">
          <Title level={1} className="!mb-6 !text-4xl md:!text-5xl !font-bold text-slate-800 drop-shadow-sm">
            Discover your <span className="text-indigo-600">Taste DNA</span>
          </Title>
          <Paragraph className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto mb-8 font-medium">
            Visualize your mind’s patterns, strengths, and blind spots through the media you love.
            Unlock new recommendations as you grow.
          </Paragraph>
          <div className="flex justify-center">
            <Button type="primary" size="large" shape="round" onClick={handleGetStarted} icon={<RocketOutlined />}>
              Start Your Journey
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                 <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                   <div className="text-4xl text-indigo-500 mb-4 flex justify-center"><BulbOutlined /></div>
                   <Title level={3} className="text-center">Psychology Driven</Title>
                   <Paragraph className="text-center">
                     We use verified frameworks like OCEAN and Jungian archetypes to map your personality.
                   </Paragraph>
                 </Card>
              </Col>
              <Col xs={24} md={8}>
                 <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                   <div className="text-4xl text-purple-500 mb-4 flex justify-center"><HeartOutlined /></div>
                   <Title level={3} className="text-center">Deep Insights</Title>
                   <Paragraph className="text-center">
                     See beyond genres. Understand <em>why</em> you like what you like - comfort, challenge, or growth.
                   </Paragraph>
                 </Card>
              </Col>
               <Col xs={24} md={8}>
                 <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                   <div className="text-4xl text-green-500 mb-4 flex justify-center"><RocketOutlined /></div>
                   <Title level={3} className="text-center">Growth Pathways</Title>
                   <Paragraph className="text-center">
                     Get recommendations that not only entertain but expand your horizons and balance your mind.
                   </Paragraph>
                 </Card>
              </Col>
            </Row>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-slate-500 font-medium">
          © {new Date().getFullYear()} BrainMirror. Your mind, visualized.
        </footer>
      </div>
    </VantaBackground>
  );
}

