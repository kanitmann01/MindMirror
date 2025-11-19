'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Input, Slider, Tag, App, Tooltip, Skeleton } from 'antd';
import { SmileOutlined, MehOutlined, FrownOutlined, ThunderboltOutlined, RocketOutlined, CoffeeOutlined, BulbOutlined } from '@ant-design/icons';
import { addMoodEntry, getUserProfile, saveUserProfile, getMoodEntries, MoodEntry } from '@/lib/firestoreUtils';
import { updateScoresWithMood, determineArchetype, OCEANScore } from '@/lib/psychologyUtils';
import { useAuth } from '@/context/AuthContext';
import InfoTooltip from './InfoTooltip';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { CheckableTag } = Tag;

const MOODS = [
  { label: 'Happy', icon: <SmileOutlined />, color: 'green' },
  { label: 'Focused', icon: <RocketOutlined />, color: 'blue' },
  { label: 'Calm', icon: <CoffeeOutlined />, color: 'cyan' },
  { label: 'Anxious', icon: <ThunderboltOutlined />, color: 'orange' },
  { label: 'Tired', icon: <MehOutlined />, color: 'purple' },
  { label: 'Sad', icon: <FrownOutlined />, color: 'red' },
];

interface MoodTrackerProps {
  onMoodLogged?: () => void; 
}

const MoodTracker = ({ onMoodLogged }: MoodTrackerProps) => {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [journalPrompt, setJournalPrompt] = useState<string | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  // Load recent moods on mount
  useEffect(() => {
    if (user) {
        const fetchHistory = async () => {
            try {
                const entries = await getMoodEntries(user.uid, 5); 
                setRecentMoods(entries.reverse()); 
                
                // Only fetch prompt if we have some data to base it on
                if (entries.length > 0) {
                     fetchJournalPrompt(entries);
                }
            } catch (e) {
                console.error("Failed to load mood history", e);
            }
        };
        fetchHistory();
    }
  }, [user]);

  const fetchJournalPrompt = async (moods: MoodEntry[]) => {
      setLoadingPrompt(true);
      try {
        // We need archetype for context too, but if it's missing backend handles it gracefully
        // Ideally we'd pass it in or fetch it, but for simplicity let's just send moods first
        // Actually, let's grab profile quick if we can, or just send minimal data
        const profile = await getUserProfile(user!.uid);
        
        const response = await fetch('/api/generate-journal-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                recentMoods: moods,
                archetype: profile?.archetype?.name || 'Unknown'
            })
        });
        const data = await response.json();
        if (data.prompt) setJournalPrompt(data.prompt);
      } catch (e) {
          console.error("Failed to get prompt", e);
      } finally {
          setLoadingPrompt(false);
      }
  };

  const handleSubmit = async () => {
    if (!user || !selectedMood) return;
    setSubmitting(true);
    try {
      const newEntry: MoodEntry = {
        mood: selectedMood,
        intensity,
        note,
        createdAt: new Date().toISOString(),
      };
      
      await addMoodEntry(user.uid, newEntry);

      const profile = await getUserProfile(user.uid);
      if (profile && profile.oceanScore) {
          const updatedScores: OCEANScore = updateScoresWithMood(profile.oceanScore, { mood: selectedMood, intensity });
          const updatedArchetype = determineArchetype(updatedScores);

          await saveUserProfile(user.uid, {
              oceanScore: updatedScores,
              archetype: updatedArchetype,
          });
          message.success('Mood tracked & Profile updated!');
      } else {
          message.success('Mood tracked successfully!');
      }

      setRecentMoods(prev => [...prev.slice(-4), newEntry]); 
      if (onMoodLogged) onMoodLogged();

      // Refresh prompt based on new mood
      fetchJournalPrompt([...recentMoods, newEntry]);

      setSelectedMood(null);
      setNote('');
      setIntensity(5);
    } catch (error) {
      console.error(error);
      message.error('Failed to save mood.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodColor = (moodLabel: string) => {
      const m = MOODS.find(x => x.label === moodLabel);
      return m ? m.color : 'gray';
  };

  return (
    <Card className="shadow-sm h-full" title={<div className="flex items-center">Mood Tracker <InfoTooltip text="Log your emotions to train the AI on your well-being patterns." /></div>}>
      <div className="space-y-6">
        
        {/* AI Journal Prompt */}
        <div className="bg-indigo-50 p-3 rounded border border-indigo-100 text-sm text-indigo-800 relative">
            {loadingPrompt ? (
                <Skeleton.Input active size="small" style={{ width: '100%' }} />
            ) : (
                <>
                    <div className="flex gap-2 items-start">
                        <BulbOutlined className="mt-1 text-indigo-500" />
                        <span className="italic">"{journalPrompt || "How are you feeling today?"}"</span>
                    </div>
                </>
            )}
        </div>

        {/* Mood History Viz */}
        {recentMoods.length > 0 && (
            <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                <Text type="secondary" style={{ fontSize: '12px' }}>Recent:</Text>
                <div className="flex gap-2">
                    {recentMoods.map((entry, idx) => (
                        <Tooltip key={idx} title={`${entry.mood} (${new Date(entry.createdAt!).toLocaleDateString()})`}>
                            <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getMoodColor(entry.mood) }}
                            />
                        </Tooltip>
                    ))}
                </div>
            </div>
        )}

        <div>
          <Text strong className="block mb-2">How are you feeling right now?</Text>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <CheckableTag
                key={mood.label}
                checked={selectedMood === mood.label}
                onChange={(checked) => setSelectedMood(checked ? mood.label : null)}
                className={`text-sm py-1 px-3 border border-gray-200 ${selectedMood === mood.label ? 'border-transparent' : ''}`}
              >
                <span className="mr-1">{mood.icon}</span>
                {mood.label}
              </CheckableTag>
            ))}
          </div>
        </div>

        {selectedMood && (
          <>
            <div>
              <Text strong className="block mb-2">Intensity (1-10)</Text>
              <Slider
                min={1}
                max={10}
                value={intensity}
                onChange={setIntensity}
                marks={{ 1: 'Low', 5: 'Medium', 10: 'High' }}
              />
            </div>

            <div>
              <Text strong className="block mb-2">Quick Note (Optional)</Text>
              <TextArea
                rows={2}
                placeholder="Reflect on the prompt..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Button type="primary" block onClick={handleSubmit} loading={submitting}>
              Save Entry
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default MoodTracker;
