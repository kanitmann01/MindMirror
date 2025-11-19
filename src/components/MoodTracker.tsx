'use client';

import React, { useState } from 'react';
import { Card, Typography, Space, Button, Input, Slider, Tag, App } from 'antd';
import { SmileOutlined, MehOutlined, FrownOutlined, ThunderboltOutlined, RocketOutlined, CoffeeOutlined } from '@ant-design/icons';
import { addMoodEntry, getUserProfile, saveUserProfile } from '@/lib/firestoreUtils';
import { updateScoresWithMood, determineArchetype } from '@/lib/psychologyUtils';
import { useAuth } from '@/context/AuthContext';

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

const MoodTracker = () => {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedMood) return;
    setSubmitting(true);
    try {
      // 1. Save Mood Entry
      await addMoodEntry(user.uid, {
        mood: selectedMood,
        intensity,
        note,
        createdAt: new Date().toISOString(),
      });

      // 2. Update User Personality Profile
      const profile = await getUserProfile(user.uid);
      if (profile && profile.oceanScore) {
          const updatedScores = updateScoresWithMood(profile.oceanScore, { mood: selectedMood, intensity });
          const updatedArchetype = determineArchetype(updatedScores);
          
          await saveUserProfile(user.uid, {
              oceanScore: updatedScores,
              archetype: updatedArchetype
          });
          message.success('Mood tracked & Profile updated!');
      } else {
          message.success('Mood tracked successfully!');
      }

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

  return (
    <Card className="shadow-sm h-full" title="Mood Tracker">
      <div className="space-y-6">
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
                placeholder="What's on your mind?"
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
