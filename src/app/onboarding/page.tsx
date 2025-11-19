'use client';

import React, { useState } from 'react';
import { Steps, Button, Card, Radio, Typography, App, Spin, ConfigProvider } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { QUESTIONS, calculateOCEAN, determineArchetype, calculateMBTI, calculateCognitive, calculateMotivations } from '@/lib/psychologyUtils';
import { saveUserProfile } from '@/lib/firestoreUtils';

const { Title, Paragraph } = Typography;

// Create a separate component for the content to use the App hook
const OnboardingContent = () => {
  const { message } = App.useApp(); // Use the hook from App context
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const oceanScore = calculateOCEAN(answers);
      const archetype = determineArchetype(oceanScore);
      const mbti = calculateMBTI(answers);
      const cognitiveStyle = calculateCognitive(answers);
      const motivations = calculateMotivations(answers);

      await saveUserProfile(user.uid, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        oceanScore,
        archetype,
        mbti,
        cognitiveStyle,
        motivations,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
      });

      message.success('Profile created! Welcome, ' + archetype.name);
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'permission-denied') {
          message.error('Permission denied. Please check your Firestore Rules.');
      } else {
          message.error('Failed to save profile: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const questionsPerPage = 5;
  const totalSteps = Math.ceil(QUESTIONS.length / questionsPerPage);
  const currentQuestions = QUESTIONS.slice(currentStep * questionsPerPage, (currentStep + 1) * questionsPerPage);
  const isStepComplete = currentQuestions.every(q => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-md">
          <Title level={2} className="text-center mb-8">Discover Your Mind</Title>
          <Steps current={currentStep} className="mb-8">
             {Array.from({ length: totalSteps }).map((_, i) => <Steps.Step key={i} />)}
          </Steps>

          <div className="space-y-8">
            {currentQuestions.map((q) => {
                const leftLabel = q.options ? q.options[0].label : 'Strongly Disagree';
                const rightLabel = q.options ? q.options[1].label : 'Strongly Agree';

                return (
                  <div key={q.id} className="bg-white p-6 rounded-lg border border-gray-200">
                    <Paragraph className="text-lg font-medium mb-6 text-center">{q.text}</Paragraph>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between w-full px-4 text-sm font-medium text-gray-500">
                        <span className="w-1/3 text-left leading-tight">{leftLabel}</span>
                        <span className="w-1/3 text-right leading-tight">{rightLabel}</span>
                      </div>
                      <div className="bg-slate-50 rounded-full px-2 py-3 w-full">
                        <ConfigProvider theme={{ components: { Radio: { buttonSolidCheckedBg: 'transparent' } } }}>
                            <Radio.Group
                              onChange={(e) => handleAnswer(q.id, e.target.value)}
                              value={answers[q.id]}
                              className="!flex !w-full !justify-between"
                              style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}
                            >
                               <div className="flex-1 flex justify-center"><Radio value={1} className="scale-125 !mr-0" /></div>
                               <div className="flex-1 flex justify-center"><Radio value={2} className="scale-110 !mr-0" /></div>
                               <div className="flex-1 flex justify-center"><Radio value={3} className="!mr-0" /></div>
                               <div className="flex-1 flex justify-center"><Radio value={4} className="scale-110 !mr-0" /></div>
                               <div className="flex-1 flex justify-center"><Radio value={5} className="scale-125 !mr-0" /></div>
                            </Radio.Group>
                        </ConfigProvider>
                      </div>
                      <div className="flex justify-between w-full px-6 text-xs text-gray-400">
                        {[1, 2, 3, 4, 5].map(n => <span key={n} className="w-4 text-center">{n}</span>)}
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>

          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button onClick={handlePrev} size="large">Previous</Button>
            )}
            {currentStep < totalSteps - 1 ? (
              <Button type="primary" onClick={handleNext} disabled={!isStepComplete} size="large">
                Next Question Set
              </Button>
            ) : (
              <Button type="primary" onClick={handleFinish} loading={submitting} disabled={!isStepComplete} size="large">
                Reveal My Archetype
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default function OnboardingPage() {
  return (
    <App>
      <OnboardingContent />
    </App>
  );
}
