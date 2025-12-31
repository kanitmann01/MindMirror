import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Progress, Result, Row, Col } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { StroopTestResult } from '@/types/brainGym';

const { Title, Text } = Typography;

interface StroopTestProps {
  onComplete: (result: StroopTestResult) => void;
  onExit: () => void;
}

const COLORS = [
  { name: 'RED', hex: '#FF0000' },
  { name: 'BLUE', hex: '#0000FF' },
  { name: 'GREEN', hex: '#008000' },
  { name: 'YELLOW', hex: '#FFD700' }, // Goldish yellow for visibility
];

const TRIALS = 20;

const StroopTest: React.FC<StroopTestProps> = ({ onComplete, onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trial, setTrial] = useState(0);
  const [stimulus, setStimulus] = useState<{ word: string; color: string } | null>(null);
  const [results, setResults] = useState<{ correct: boolean; reactionTime: number }[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setTrial(0);
    setResults([]);
    nextTrial();
  };

  const nextTrial = () => {
    if (results.length >= TRIALS) {
      finishGame();
      return;
    }

    setTrial(prev => prev + 1);
    
    // Generate Stimulus (Incongruent vs Congruent)
    // Stroop effect relies on incongruent mostly. Let's do 70% incongruent.
    const isIncongruent = Math.random() < 0.7;
    
    const wordObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    let colorObj = wordObj;

    if (isIncongruent) {
        // Pick a different color
        const others = COLORS.filter(c => c.name !== wordObj.name);
        colorObj = others[Math.floor(Math.random() * others.length)];
    }

    setStimulus({ word: wordObj.name, color: colorObj.hex });
    startTimeRef.current = Date.now();
  };

  const handleResponse = (selectedColorName: string) => {
    if (!stimulus) return;
    
    const reactionTime = Date.now() - startTimeRef.current;
    
    // Correct if selected color name (ink) matches the displayed ink color's name (which we can derive or pass)
    // Wait, stimulus.color is hex. We need to match it back to name or store name.
    // Let's check against COLORS list.
    const correctColorObj = COLORS.find(c => c.hex === stimulus.color);
    const isCorrect = correctColorObj?.name === selectedColorName;

    setResults(prev => [...prev, { correct: isCorrect, reactionTime }]);
    
    // Tiny delay or immediate? Immediate is better for reaction tasks.
    nextTrial();
  };

  const finishGame = () => {
    setIsPlaying(false);
    
    const correctCount = results.filter(r => r.correct).length;
    const errorCount = results.length - correctCount;
    const errorRate = (errorCount / results.length) * 100;
    const avgReactionTime = results.reduce((a, b) => a + b.reactionTime, 0) / results.length;

    const result: StroopTestResult = {
        gameId: 'stroop-test',
        timestamp: new Date().toISOString(),
        durationSeconds: results.reduce((a, b) => a + b.reactionTime, 0) / 1000, // Roughly sum of RTs (plus gaps)
        errorRate,
        avgReactionTimeMs: avgReactionTime,
        totalTrials: results.length
    };

    onComplete(result);
  };

  if (!stimulus) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-2xl mx-auto">
      <div className="w-full flex justify-between items-center mb-12">
        <div>
            <Title level={4}>Stroop Test</Title>
            <Text>Select the <span className="font-bold">INK COLOR</span>, ignore the word.</Text>
        </div>
        <Button onClick={onExit} icon={<ReloadOutlined />}>Exit</Button>
      </div>

      {/* Stimulus Area */}
      <div className="flex-grow flex items-center justify-center mb-12">
        <div 
            className="text-8xl font-black tracking-wider transition-all duration-100"
            style={{ color: stimulus.color }}
        >
            {stimulus.word}
        </div>
      </div>

      {/* Response Buttons */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-lg mb-8">
        {COLORS.map(c => (
            <Button 
                key={c.name}
                size="large"
                className="h-20 text-xl font-bold border-2"
                onClick={() => handleResponse(c.name)}
                // We don't color the buttons to avoid giving hints? 
                // Or we color them neutrally? Or match color?
                // Standard Stroop often uses colored buttons or labeled keys.
                // Let's use neutral buttons with colored text or borders?
                // Or just the word of the color in black?
                // "User must click the button for the Ink Color (Blue)"
                // Let's use colored borders/text to help mapping.
                style={{ borderColor: c.hex, color: c.hex }}
            >
                {c.name}
            </Button>
        ))}
      </div>

      <Progress percent={(trial / TRIALS) * 100} showInfo={false} className="w-full" />
      <Text type="secondary" className="mt-2">Trial {trial + 1} / {TRIALS}</Text>
    </div>
  );
};

export default StroopTest;

