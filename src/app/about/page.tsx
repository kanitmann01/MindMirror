'use client';

import React from 'react';
import { Typography, Card, Divider, Button, Row, Col } from 'antd';
import { ArrowLeftOutlined, BookOutlined, ExperimentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import VantaBackground from '@/components/VantaBackground';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
  const router = useRouter();

  return (
    <VantaBackground>
      <div className="min-h-screen flex flex-col relative z-10 overflow-y-auto">
        {/* Navigation Header */}
        <div className="max-w-4xl mx-auto w-full p-6 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600 cursor-pointer" onClick={() => router.push('/')}>
            MindMirror
          </div>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/dashboard')}
            className="bg-black hover:bg-gray-800 border-none shadow-lg"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto w-full px-6 pb-20">
          
          {/* Section 1: The Core Thesis */}
          <section className="mb-16 text-center">
            <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
              The Manifesto
            </div>
            <Title level={1} className="!text-5xl md:!text-6xl !font-serif text-slate-900 mb-8 drop-shadow-sm">
              The Science of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Digital Nutrition
              </span>
            </Title>
            <Paragraph className="text-xl md:text-2xl text-slate-700 leading-relaxed max-w-3xl mx-auto font-serif">
              If food inputs determine physical health, information inputs determine psychological health. 
              By tracking and visualizing the semantic weight of media consumption, we can model and influence 
              short-term character fluidity.
            </Paragraph>
          </section>

          {/* Section 2: The Math */}
          <section className="mb-16">
            <Card className="border-none shadow-2xl bg-white/10 backdrop-blur-md overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ExperimentOutlined className="text-3xl text-indigo-600" />
                  <Title level={2} className="!mb-0 !font-serif">The Mathematics of "Mind Mapping"</Title>
                </div>
                
                <Paragraph className="text-lg text-slate-700 mb-8">
                  MindMirror does not simply "add" points. It calculates a <strong>Fluid Average</strong>, treating your personality as a moving state rather than a static trait.
                </Paragraph>

                <div className="grid gap-8 md:grid-cols-2">
                  {/* Formula 1: Weighted Average */}
                  <div className="bg-white/50 p-6 rounded-xl border border-white/20 shadow-inner">
                    <Title level={4} className="text-slate-800 mb-4 font-serif italic">The Scoring Algorithm</Title>
                    <div className="bg-slate-900 text-white p-6 rounded-lg font-serif text-center text-xl mb-4 shadow-lg flex justify-center items-center overflow-x-auto">
                      <span className="whitespace-nowrap">
                        S<sub className="text-xs">new</sub> = 
                        <span className="inline-block mx-2 align-middle text-left">
                          <span className="block border-b border-white mb-1 pb-1">
                            (S<sub className="text-xs">curr</sub> × M<sub className="text-xs">decay</sub>) + (I<sub className="text-xs">media</sub> × W<sub className="text-xs">impact</sub>)
                          </span>
                          <span className="block text-center">
                            M<sub className="text-xs">decay</sub> + W<sub className="text-xs">impact</sub>
                          </span>
                        </span>
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p><strong className="text-indigo-600">S<sub>new</sub>:</strong> The updated Trait Score (0-100)</p>
                      <p><strong className="text-indigo-600">M<sub>decay</sub>:</strong> The "Mass" of history (Total items × Time Decay)</p>
                      <p><strong className="text-indigo-600">I<sub>media</sub>:</strong> Semantic score of the item (e.g., Dune = 90 Openness)</p>
                      <p><strong className="text-indigo-600">W<sub>impact</sub>:</strong> User-defined "Intensity" (1-5 stars)</p>
                    </div>
                  </div>

                  {/* Formula 2: Time Decay */}
                  <div className="bg-white/50 p-6 rounded-xl border border-white/20 shadow-inner">
                    <Title level={4} className="text-slate-800 mb-4 font-serif italic">The Time Decay Function</Title>
                    <div className="bg-slate-900 text-white p-6 rounded-lg font-serif text-center text-2xl mb-4 shadow-lg flex justify-center items-center h-[140px]">
                      <span>
                        W<sub className="text-sm">t</sub> = 0.5<sup className="text-lg relative -top-2">(t / 90)</sup>
                      </span>
                    </div>
                    <Paragraph className="text-slate-600 text-sm">
                      <strong>Neuroplasticity requires reinforcement.</strong> We model memory fade using a Half-Life of 90 Days. 
                      A book read 3 months ago exerts only 50% of its original influence. This ensures your profile represents 
                      <em> "Who you are today,"</em> not who you were years ago.
                    </Paragraph>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Section 3: The Models */}
          <section>
            <div className="flex items-center gap-3 mb-8 justify-center">
              <BookOutlined className="text-3xl text-violet-600" />
              <Title level={2} className="!mb-0 !font-serif text-center">Psychological Frameworks</Title>
            </div>

            <Row gutter={[24, 24]}>
              {/* OCEAN Model */}
              <Col xs={24} md={12}>
                <Card className="h-full border-0 shadow-xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all">
                  <Title level={3} className="!font-serif text-indigo-800">The OCEAN Model</Title>
                  <Text type="secondary" className="block mb-4 font-mono text-xs uppercase tracking-wider">The Big Five</Text>
                  <Paragraph className="text-slate-800">
                    We measure personality on five sliding scales. Unlike static tests, these are fluid states that fluctuate based on your recent "diet."
                  </Paragraph>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700">
                    <li><strong>Openness:</strong> Sci-Fi, Philosophy, Avant-Garde Art.</li>
                    <li><strong>Conscientiousness:</strong> Productivity, Strategy, How-To.</li>
                    <li><strong>Extraversion:</strong> Social Media, Vlogs, Interviews.</li>
                    <li><strong>Agreeableness:</strong> Community, Romance, Wholesome.</li>
                    <li><strong>Neuroticism:</strong> Horror, Dystopian, High-Stress.</li>
                  </ul>
                </Card>
              </Col>

              {/* Jungian Archetypes */}
              <Col xs={24} md={12}>
                <Card className="h-full border-0 shadow-xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all">
                  <Title level={3} className="!font-serif text-violet-800">Jungian Archetypes</Title>
                  <Text type="secondary" className="block mb-4 font-mono text-xs uppercase tracking-wider">The Identity Layer</Text>
                  <Paragraph className="text-slate-800">
                    While OCEAN provides the coordinates, Archetypes provide the identity. We use K-Nearest Neighbors to map your vector to the nearest centroid of 12 classic archetypes.
                  </Paragraph>
                  <div className="space-y-3 mt-4">
                    <div className="p-3 bg-white/40 rounded-lg">
                      <strong className="block text-indigo-900">The Explorer</strong>
                      <span className="text-sm text-slate-600">High Openness + Low Neuroticism</span>
                    </div>
                    <div className="p-3 bg-white/40 rounded-lg">
                      <strong className="block text-indigo-900">The Sentinel</strong>
                      <span className="text-sm text-slate-600">High Conscientiousness + High Agreeableness</span>
                    </div>
                    <div className="p-3 bg-white/40 rounded-lg">
                      <strong className="block text-indigo-900">The Analyst</strong>
                      <span className="text-sm text-slate-600">High Openness + High Conscientiousness</span>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </section>

          <Divider className="my-16 border-slate-300" />

          <div className="text-center">
            <Title level={4} className="!font-serif text-slate-500 italic mb-8">
              "We shape our tools and thereafter our tools shape us." - Marshall McLuhan
            </Title>
            <Button 
              type="primary" 
              size="large" 
              shape="round"
              icon={<ThunderboltOutlined />}
              onClick={() => router.push('/dashboard')}
              className="h-14 px-10 text-lg bg-gradient-to-r from-indigo-600 to-violet-600 border-none shadow-xl hover:scale-105 transition-transform"
            >
              Begin Neural Calibration
            </Button>
          </div>
        </div>
      </div>
    </VantaBackground>
  );
};

export default AboutPage;
