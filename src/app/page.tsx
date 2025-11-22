'use client';

import React, { useEffect } from 'react';
import { Button, Typography, Card, Row, Col, Space } from 'antd';
import { RocketOutlined, BulbOutlined, HeartOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import VantaBackground from '@/components/VantaBackground';
import DemoMindMap from '@/components/DemoMindMap';

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
          <div className="text-2xl font-bold text-indigo-600">MindMirror</div>
          <Space>
            {user ? (
              <Button type="primary" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            ) : (
              <Button type="primary" onClick={signInWithGoogle}>Login</Button>
            )}
          </Space>
        </header>

        {/* Hero */}
        <section className="text-center py-12 px-4 md:py-20 flex-1 flex flex-col justify-center items-center">
          <Title level={1} className="!mb-6 !text-4xl md:!text-5xl !font-bold text-slate-800 drop-shadow-sm">
            Discover your <span className="text-indigo-600">Taste DNA</span>
          </Title>
          <Paragraph className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto mb-8 font-medium">
            Visualize your mind’s patterns, strengths, and blind spots through the media you love.
            Unlock new recommendations as you grow.
          </Paragraph>
          
          <div className="w-full max-w-4xl mb-12 mx-auto px-4">
             <DemoMindMap />
          </div>

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

        {/* Manifesto Teaser */}
        <section className="py-20 bg-white/50 backdrop-blur-sm border-y border-white/20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
              The Manifesto
            </div>
            <Title level={2} className="!text-3xl md:!text-4xl !font-serif text-slate-900 mb-6">
              You Are What You Consume
            </Title>
            <Paragraph className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8 font-serif max-w-3xl mx-auto">
              Neuroplasticity doesn't stop at childhood. Every book, movie, and song you consume strengthens specific neural pathways. 
              MindMirror is built on the <strong>Digital Nutrition Hypothesis</strong>: that we can actively shape who we become by curating our information diet.
            </Paragraph>
            <Button 
              type="default" 
              size="large" 
              shape="round" 
              icon={<ExperimentOutlined />}
              onClick={() => router.push('/about')}
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 h-12 px-8"
            >
              Read the Science
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-slate-500 font-medium">
          © {new Date().getFullYear()} MindMirror. Your mind, visualized.
          <div className="mt-2 text-sm space-x-4">
             <a href="/about" className="hover:text-indigo-500 transition-colors">Methodology & Science</a>
            <span className="text-slate-300">•</span>
            <a href="/privacy" className="hover:text-indigo-500 transition-colors">Privacy Policy</a>
          </div>
        </footer>
      </div>
    </VantaBackground>
  );
}

