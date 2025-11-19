'use client';

import React, { useState, useEffect } from 'react';
import { Steps, Button, Card, Radio, Typography, App, Input, Checkbox, Form } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { saveUserProfile, UserProfile } from '@/lib/firestoreUtils';
import { calculateOCEAN, determineArchetype, QUESTIONS, calculateMBTI, calculateCognitive, calculateMotivations } from '@/lib/psychologyUtils';
import { CheckCircleOutlined, ArrowRightOutlined, RocketOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const OnboardingPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const finishOnboarding = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // 1. Calculate Scores
      const oceanScore = calculateOCEAN(answers);
      const archetype = determineArchetype(oceanScore);
      const mbti = calculateMBTI(answers);
      const cognitiveStyle = calculateCognitive(answers);
      const motivations = calculateMotivations(answers);

      // 2. Save to Firestore
      const profileData: Partial<UserProfile> = {
        oceanScore,
        archetype,
        mbti,
        cognitiveStyle,
        motivations,
        goals, // Save goals
      };

      await saveUserProfile(user.uid, profileData);
      message.success('Profile created successfully!');
      
      // Small delay for UX
      setTimeout(() => {
         router.push('/dashboard');
      }, 1000);

    } catch (error) {
      console.error(error);
      message.error('Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  const steps = [
    {
        title: 'Goals',
        content: (
            <div className="py-4">
                <Title level={4}>What brings you to BrainMirror?</Title>
                <Paragraph>Select your primary goals to help us personalize your experience.</Paragraph>
                <Checkbox.Group 
                    className="flex flex-col gap-3 w-full" 
                    onChange={(checkedValues) => setGoals(checkedValues as string[])}
                    value={goals}
                >
                    <div className="p-3 border rounded hover:bg-blue-50 transition-colors">
                        <Checkbox value="self-discovery">Understanding my personality & archetype</Checkbox>
                    </div>
                    <div className="p-3 border rounded hover:bg-blue-50 transition-colors">
                        <Checkbox value="reduce-anxiety">Managing stress & anxiety</Checkbox>
                    </div>
                    <div className="p-3 border rounded hover:bg-blue-50 transition-colors">
                        <Checkbox value="better-habits">Building better media habits</Checkbox>
                    </div>
                    <div className="p-3 border rounded hover:bg-blue-50 transition-colors">
                        <Checkbox value="new-hobbies">Discovering new interests & hobbies</Checkbox>
                    </div>
                    <div className="p-3 border rounded hover:bg-blue-50 transition-colors">
                        <Checkbox value="productivity">Improving focus & productivity</Checkbox>
                    </div>
                </Checkbox.Group>
            </div>
        )
    },
    {
      title: 'Personality',
      content: (
        <div className="space-y-6">
           <Title level={4}>Let's understand your core traits (OCEAN).</Title>
           <Paragraph type="secondary">Answer honestly. There are no right or wrong answers.</Paragraph>
           {QUESTIONS.filter(q => q.category === 'ocean').map((q) => (
             <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
               <Text strong className="block mb-3">{q.text}</Text>
               <Radio.Group 
                 onChange={e => handleAnswer(q.id, e.target.value)} 
                 value={answers[q.id]}
                 style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}
               >
                 <div className="flex flex-col items-center flex-1"><Radio value={1} /><span className="text-xs text-gray-400 mt-1">Disagree</span></div>
                 <div className="flex flex-col items-center flex-1"><Radio value={2} /></div>
                 <div className="flex flex-col items-center flex-1"><Radio value={3} /><span className="text-xs text-gray-400 mt-1">Neutral</span></div>
                 <div className="flex flex-col items-center flex-1"><Radio value={4} /></div>
                 <div className="flex flex-col items-center flex-1"><Radio value={5} /><span className="text-xs text-gray-400 mt-1">Agree</span></div>
               </Radio.Group>
             </div>
           ))}
        </div>
      ),
    },
    {
      title: 'Cognition',
      content: (
        <div className="space-y-6">
           <Title level={4}>How do you process the world?</Title>
           {QUESTIONS.filter(q => q.category === 'mbti' || q.category === 'cognitive').map((q) => (
             <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
               <Text strong className="block mb-3">{q.text}</Text>
               <Radio.Group 
                 onChange={e => handleAnswer(q.id, e.target.value)} 
                 value={answers[q.id]}
                 className="w-full flex flex-col gap-2"
               >
                  {q.options ? (
                      q.options.map(opt => (
                          <Radio key={opt.value} value={opt.value} className="p-2 border rounded bg-white hover:border-blue-400">
                              {opt.label}
                          </Radio>
                      ))
                  ) : (
                       <div className="flex justify-between mt-2">
                           <Radio value={1}>Strongly Disagree</Radio>
                           <Radio value={5}>Strongly Agree</Radio>
                       </div>
                  )}
               </Radio.Group>
             </div>
           ))}
        </div>
      )
    },
    {
        title: 'Motivation',
        content: (
            <div className="space-y-6">
            <Title level={4}>What drives you?</Title>
            {QUESTIONS.filter(q => q.category === 'motivation').map((q) => (
                <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                <Text strong className="block mb-3">{q.text}</Text>
                <Radio.Group 
                    onChange={e => handleAnswer(q.id, e.target.value)} 
                    value={answers[q.id]}
                    style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}
                >
                    <div className="flex flex-col items-center flex-1"><Radio value={1} /><span className="text-xs text-gray-400 mt-1">Not me</span></div>
                    <div className="flex flex-col items-center flex-1"><Radio value={2} /></div>
                    <div className="flex flex-col items-center flex-1"><Radio value={3} /><span className="text-xs text-gray-400 mt-1">Neutral</span></div>
                    <div className="flex flex-col items-center flex-1"><Radio value={4} /></div>
                    <div className="flex flex-col items-center flex-1"><Radio value={5} /><span className="text-xs text-gray-400 mt-1">Totally me</span></div>
                </Radio.Group>
                </div>
            ))}
            </div>
        )
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="shadow-xl">
        <div className="mb-8">
            <Title level={2} className="text-center">Build Your BrainMirror</Title>
            <Paragraph className="text-center text-gray-500">
                Help us construct your initial psychological profile.
            </Paragraph>
        </div>

        <Steps current={currentStep} items={steps.map(s => ({ title: s.title }))} className="mb-8" />

        <div className="min-h-[300px]">
          {steps[currentStep].content}
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t">
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)} icon={<ArrowRightOutlined />}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={finishOnboarding} loading={loading} icon={<CheckCircleOutlined />} size="large">
              Reveal My Profile
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OnboardingPage;
