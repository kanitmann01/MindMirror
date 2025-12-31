'use client';

import React, { useState, useEffect } from 'react';
import { Card, Slider, Button, Typography, App, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { saveUserProfile, UserProfile } from '@/lib/firestoreUtils';
import { determineArchetype, OCEANScore, updateTrait, TraitDistribution } from '@/lib/psychologyUtils';
import { ArrowRightOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import QuizSelection from '@/components/QuizSelection';
import VantaBackground from '@/components/VantaBackground';

const { Title, Text } = Typography;

// --- Data Structures ---

interface IPIPQuestion {
  id: string;
  trait: string; // 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'
  left: string;
  right: string;
  label: string;
}

const QUICK_QUESTIONS: IPIPQuestion[] = [
  // EXTRAVERSION
  { id: 'e1', trait: 'extraversion', left: 'Solitary Recharge 🔋', right: 'Social Recharge ⚡', label: 'Energy Source' },
  { id: 'e2', trait: 'extraversion', left: 'Observer 👀', right: 'Center of Attention 🗣️', label: 'Social Presence' },

  // OPENNESS
  { id: 'o1', trait: 'openness', left: 'Proven Methods 🛡️', right: 'New Experiments 🧪', label: 'Approach to Problems' },
  { id: 'o2', trait: 'openness', left: 'Concrete Facts 🧱', right: 'Abstract Theories 🌌', label: 'Mental Focus' },

  // CONSCIENTIOUSNESS
  { id: 'c1', trait: 'conscientiousness', left: 'Spontaneous / Flexible 🌊', right: 'Structured / Planned 📋', label: 'Organization' },
  { id: 'c2', trait: 'conscientiousness', left: 'Procrastination ⏳', right: 'Immediate Action ✅', label: 'Task Management' },

  // AGREEABLENESS
  { id: 'a1', trait: 'agreeableness', left: 'Skepticism 🤨', right: 'Trust in Others 🤝', label: 'View of Human Nature' },
  { id: 'a2', trait: 'agreeableness', left: 'Competitive 🏆', right: 'Cooperative 🤲', label: 'Conflict Style' },

  // NEUROTICISM
  { id: 'n1', trait: 'neuroticism', left: 'Calm Under Pressure 🧊', right: 'Reactive to Stress 🔥', label: 'Stress Response' },
  { id: 'n2', trait: 'neuroticism', left: 'Unshakeable Confidence 🦁', right: 'Self-Doubt ☁️', label: 'Self-Perception' }
];

const DEEP_QUESTIONS: IPIPQuestion[] = [
  // --- OPENNESS FACETS ---
  { id: 'o_f1', trait: 'openness', left: 'Literal / Practical 🔨', right: 'Imaginative / Fantasy 🦄', label: 'Imagination' },
  { id: 'o_f2', trait: 'openness', left: 'Routine Aesthetics 🏠', right: 'Artistic Beauty 🎨', label: 'Aesthetics' },
  { id: 'o_f3', trait: 'openness', left: 'Stick to Habits 🔄', right: 'Seek Novelty ✈️', label: 'Adventurousness' },
  { id: 'o_f4', trait: 'openness', left: 'Discomfort with Emotion 😐', right: 'Deeply Emotional ❤️', label: 'Emotionality' },
  { id: 'o_f5', trait: 'openness', left: 'Conservative / Traditional 🏛️', right: 'Liberal / Progressive ✊', label: 'Values' },

  // --- CONSCIENTIOUSNESS FACETS ---
  { id: 'c_f1', trait: 'conscientiousness', left: 'Unprepared 🤷', right: 'Ready for Anything 🎒', label: 'Self-Efficacy' },
  { id: 'c_f2', trait: 'conscientiousness', left: 'Messy / Chaotic 🌪️', right: 'Orderly / Tidy 📂', label: 'Orderliness' },
  { id: 'c_f3', trait: 'conscientiousness', left: 'Flexible with Promises 🤞', right: 'Strictly Reliable 🤝', label: 'Dutifulness' },
  { id: 'c_f4', trait: 'conscientiousness', left: 'Content with Minimum 📉', right: 'Drive for Excellence 📈', label: 'Achievement' },
  { id: 'c_f5', trait: 'conscientiousness', left: 'Impulsive / Hasty 🐇', right: 'Deliberate / Cautious 🐢', label: 'Deliberation' },

  // --- EXTRAVERSION FACETS ---
  { id: 'e_f1', trait: 'extraversion', left: 'Reserved 😶', right: 'Friendly / Warm 🤗', label: 'Friendliness' },
  { id: 'e_f2', trait: 'extraversion', left: 'Prefer Small Groups 👥', right: 'Love Large Crowds 🎉', label: 'Gregariousness' },
  { id: 'e_f3', trait: 'extraversion', left: 'Follower 🐑', right: 'Leader 🦁', label: 'Assertiveness' },
  { id: 'e_f4', trait: 'extraversion', left: 'Leisurely Pace 🚶', right: 'Vigorous Pace 🏃', label: 'Activity Level' },
  { id: 'e_f5', trait: 'extraversion', left: 'Calm / Serene 🌅', right: 'Thrill-Seeking 🎢', label: 'Excitement' },

  // --- AGREEABLENESS FACETS ---
  { id: 'a_f1', trait: 'agreeableness', left: 'Wary of Others 🕵️', right: 'Believe the Best in People 😇', label: 'Trust' },
  { id: 'a_f2', trait: 'agreeableness', left: 'Cunning / Strategic ♟️', right: 'Frank / Sincere 📖', label: 'Morality' },
  { id: 'a_f3', trait: 'agreeableness', left: 'Self-Interest First 💰', right: 'Helping Others First 🆘', label: 'Altruism' },
  { id: 'a_f4', trait: 'agreeableness', left: 'Confrontational 🥊', right: 'Peacemaker 🏳️', label: 'Cooperation' },
  { id: 'a_f5', trait: 'agreeableness', left: 'Superior / Prideful 👑', right: 'Humble / Modest 🙏', label: 'Modesty' },

  // --- NEUROTICISM FACETS ---
  { id: 'n_f1', trait: 'neuroticism', left: 'Worry-Free 🌈', right: 'Prone to Worry 😟', label: 'Anxiety' },
  { id: 'n_f2', trait: 'neuroticism', left: 'Keep Cool ❄️', right: 'Short Temper 😡', label: 'Anger' },
  { id: 'n_f3', trait: 'neuroticism', left: 'Optimistic ☀️', right: 'Melancholic 🌧️', label: 'Depression' },
  { id: 'n_f4', trait: 'neuroticism', left: 'Comfortable in Skin 😌', right: 'Self-Conscious 😳', label: 'Social Anxiety' },
  { id: 'n_f5', trait: 'neuroticism', left: 'Resistant to Cravings 🥗', right: 'Give in to Temptation 🍰', label: 'Immoderation' }
];

const splitLabel = (text: string) => {
  const parts = text.split(' ');
  // Assuming the emoji is always the last part
  if (parts.length > 1) {
    const emoji = parts.pop();
    const label = parts.join(' ');
    return { label, emoji };
  }
  return { label: text, emoji: '' };
};

const QuizPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();

  const [mode, setMode] = useState<'quick' | 'deep' | null>(null);
  const [questions, setQuestions] = useState<IPIPQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Handle mode selection synchronously to prevent render crashes
  const handleModeSelect = (selectedMode: 'quick' | 'deep') => {
    setMode(selectedMode);
    if (selectedMode === 'quick') {
      setQuestions(QUICK_QUESTIONS);
    } else {
      setQuestions(DEEP_QUESTIONS);
    }
    setCurrentIndex(0);
  };

  const handleAnswer = (val: number) => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setMode(null); // Go back to selection
      setQuestions([]); // Clear questions for safety
    }
  };

  const finishQuiz = async () => {
    if (!user || !mode) return;
    setLoading(true);

    try {
      // --- Phase 3: Scoring Logic (Bayesian) ---
      
      // Initialize priors (Mean 50, High Variance)
      // Using explicit type to avoid index signature issues
      const distributions: {
        openness: TraitDistribution;
        conscientiousness: TraitDistribution;
        extraversion: TraitDistribution;
        agreeableness: TraitDistribution;
        neuroticism: TraitDistribution;
      } = {
        openness: { mean: 50, variance: 500 },
        conscientiousness: { mean: 50, variance: 500 },
        extraversion: { mean: 50, variance: 500 },
        agreeableness: { mean: 50, variance: 500 },
        neuroticism: { mean: 50, variance: 500 }
      };

      // Aggregate Scores using Bayesian Updates
      questions.forEach(q => {
        const val = answers[q.id];
        if (val !== undefined) {
          const traitKey = q.trait as keyof typeof distributions;
          // val is 0-100 from slider
          // Uncertainty 200 for a single quiz question
          if (distributions[traitKey]) {
            distributions[traitKey] = updateTrait(distributions[traitKey], val, 200);
          }
        }
      });

      // Construct OCEANScore object
      const oceanScore: OCEANScore = {
        openness: Math.round(distributions.openness.mean),
        conscientiousness: Math.round(distributions.conscientiousness.mean),
        extraversion: Math.round(distributions.extraversion.mean),
        agreeableness: Math.round(distributions.agreeableness.mean),
        neuroticism: Math.round(distributions.neuroticism.mean),
        distributions: distributions
      };

      // Determine Archetype
      const archetype = determineArchetype(oceanScore);

      // Save to Firestore
      const profileData: Partial<UserProfile> = {
        oceanScore,
        archetype,
        profile_precision: mode === 'deep' ? 'high' : 'low',
      };

      await saveUserProfile(user.uid, profileData);
      message.success('Profile calibrated successfully!');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (error) {
      console.error(error);
      message.error('Failed to save results.');
      setLoading(false);
    }
  };

  if (authLoading) return <div className="p-10 text-center"><Spin size="large" /></div>;
  if (!user) return <div className="p-10 text-center"><Spin size="large" tip="Redirecting..." /></div>;

  // Phase 1: Selection Interface
  if (!mode || questions.length === 0) {
    return (
      <VantaBackground className="flex items-center justify-center p-4">
        <QuizSelection onSelect={handleModeSelect} />
      </VantaBackground>
    );
  }

  // Phase 4: The UI (Slider Component)
  const currentQuestion = questions[currentIndex];
  const progress = Math.round(((currentIndex) / questions.length) * 100);
  const currentValue = answers[currentQuestion.id] ?? 50;

  // Dynamic Scales
  const leftScale = 0.8 + (0.7 * ((100 - currentValue) / 100));
  const rightScale = 0.8 + (0.7 * (currentValue / 100));
  const trackColor = currentValue > 50 ? '#8b5cf6' : '#818cf8'; // Violet vs Indigo

  // Parsing Labels
  const leftParts = splitLabel(currentQuestion.left);
  const rightParts = splitLabel(currentQuestion.right);

  // Safety check
  if (!currentQuestion) {
      return <div className="p-10 text-center"><Spin /></div>;
  }

  return (
    <VantaBackground>
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-2xl shadow-xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm border-0">
          {/* Progress Bar - Thin Line */}
          <div className="h-1.5 bg-gray-100 w-full absolute top-0 left-0">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="pt-8 pb-6 px-4 sm:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-800"
              >
                Back
              </Button>
              <Text type="secondary" className="text-sm font-mono font-bold text-gray-400">
                {currentIndex + 1} / {questions.length}
              </Text>
              <Button
                type="text"
                size="small"
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-red-500"
              >
                Exit
              </Button>
            </div>

            {/* Question Content */}
            <div className="min-h-[320px] flex flex-col justify-center fade-in-fast">
              <div className="text-center mb-16">
                <Text type="secondary" className="uppercase tracking-[0.2em] text-xs font-bold mb-3 block text-indigo-400">
                  {currentQuestion.trait}
                </Text>
                <Title level={2} className="!mb-0 text-slate-800">
                  {currentQuestion.label}
                </Title>
              </div>

              <div className="px-2 sm:px-8 mb-8">
                <div className="relative">
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={currentValue}
                    onChange={handleAnswer}
                    tooltip={{ open: false }}
                    trackStyle={{ backgroundColor: trackColor, height: 12, borderRadius: 6 }}
                    railStyle={{ backgroundColor: '#f1f5f9', height: 12, borderRadius: 6 }}
                    handleStyle={{ 
                      borderColor: trackColor, 
                      backgroundColor: '#fff', 
                      width: 28, 
                      height: 28, 
                      marginTop: -8,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      opacity: 1
                    }}
                  />
                </div>
                
                {/* Dynamic Labels & Emojis */}
                <div className="flex justify-between mt-8 items-center">
                  {/* Left Label */}
                  <div className={`flex flex-col items-center transition-all duration-300 w-1/3 text-center ${currentValue < 50 ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                    <div className="text-4xl mb-2 transition-transform duration-300" style={{ transform: `scale(${leftScale})` }}>
                      {leftParts.emoji}
                    </div>
                    <span className="text-sm font-semibold text-slate-600 leading-tight">{leftParts.label}</span>
                  </div>

                  {/* Center Hint (Optional, visually subtle if needed, but user asked to remove "Neutral") */}
                  {/* <div className="w-px h-8 bg-gray-200" /> */} 

                  {/* Right Label */}
                  <div className={`flex flex-col items-center transition-all duration-300 w-1/3 text-center ${currentValue > 50 ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                    <div className="text-4xl mb-2 transition-transform duration-300" style={{ transform: `scale(${rightScale})` }}>
                      {rightParts.emoji}
                    </div>
                    <span className="text-sm font-semibold text-slate-600 leading-tight">{rightParts.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-center pt-6 border-t border-gray-100 mt-4">
              <Button 
                type="primary" 
                size="large" 
                onClick={handleNext} 
                loading={loading}
                className="w-full sm:w-auto px-10 h-14 text-lg font-medium shadow-lg shadow-indigo-200 bg-gradient-to-r from-indigo-600 to-violet-600 border-none hover:scale-105 transition-transform"
                icon={currentIndex === questions.length - 1 ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
              >
                {currentIndex === questions.length - 1 ? 'Complete Profile' : 'Confirm & Continue'}
              </Button>
            </div>
          </div>
        </Card>
        
        <style jsx global>{`
          .fade-in-fast {
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); scale: 0.98; }
            to { opacity: 1; transform: translateY(0); scale: 1; }
          }
        `}</style>
      </div>
    </VantaBackground>
  );
};

export default QuizPage;