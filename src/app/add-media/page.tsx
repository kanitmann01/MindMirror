'use client';

import React, { useState } from 'react';
import { Form, Input, Select, Rate, Button, Card, Typography, App } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { addMediaItem, MediaItem, getUserProfile, saveUserProfile } from '@/lib/firestoreUtils';
import { updateScoresWithMedia, determineArchetype, MOOD_CONSTANTS } from '@/lib/psychologyUtils';
import { checkSignificantShift } from '@/lib/gamificationUtils';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;

interface AddMediaContentProps {
  // Define any props if necessary
}

const AddMediaContent: React.FC<AddMediaContentProps> = () => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const router = useRouter();

  const onFinish = async (values: Omit<MediaItem, 'id' | 'createdAt'>) => {
    if (!user) return;
    setLoading(true);
    try {
      const mediaItem = {
        ...values,
        createdAt: new Date().toISOString(),
      };

      await addMediaItem(user.uid, mediaItem);

      // Update personality profile
      const profile = await getUserProfile(user.uid);
      if (profile && profile.oceanScore) {
        const updatedScores = updateScoresWithMedia(profile.oceanScore, [mediaItem]);
        const updatedArchetype = determineArchetype(updatedScores);

        // Check for significant shift (Gamification)
        const hasShifted = checkSignificantShift(profile.oceanScore, updatedScores);

        await saveUserProfile(user.uid, {
          oceanScore: updatedScores,
          archetype: updatedArchetype,
        });

        if (hasShifted) {
          message.success({
            content: 'Significant Shift Detected! You unlocked the "Shifting Perspective" badge! 🦋',
            duration: 5,
          });
        } else {
          message.success('Media added and profile updated!');
        }
      } else {
        message.success('Media added!');
      }

      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error('Failed to add media.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <Title level={2} className="text-center mb-6">Add to Your Collection</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            rating: 3,
            category: 'book'
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter the title' }]}
          >
            <Input placeholder="e.g., Dune, Spirited Away, Minecraft..." />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="book">Book</Option>
              <Option value="anime">Anime</Option>
              <Option value="movie">Movie</Option>
              <Option value="game">Game</Option>
              <Option value="youtube">YouTube Channel/Video</Option>
              <Option value="spotify">Spotify Artist/Album</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="rating"
            label="Psychological Intensity"
            help={
              <div className="text-xs text-gray-500 mt-1">
                {(() => {
                  const val = form.getFieldValue('rating');
                  if (!val) return "How much did this affect you emotionally?";
                  if (val <= 2) return "Light / Passive Entertainment";
                  if (val <= 4) return "Engaging / Thought Provoking";
                  return "Deeply Transformative / Life Changing";
                })()}
              </div>
            }
          >
            <Rate allowHalf onChange={() => { /* Force re-render for help text update */ }} />
          </Form.Item>

          <Form.Item
            name="mood"
            label="Mood / Vibe"
            rules={[{ required: true, message: 'Please select the primary mood' }]}
          >
            <Select mode="tags" placeholder="Select or type moods">
                {/* Standardized Moods */}
                <Option value="Happy">Happy ☀️</Option>
                <Option value="Focused">Focused 🎯</Option>
                <Option value="Calm">Calm 🍃</Option>
                <Option value="Anxious">Anxious ⚡</Option>
                <Option value="Tired">Tired 🥱</Option>
                <Option value="Sad">Sad 🌧️</Option>
                
                {/* Legacy / Extra Options mapped to nearby concepts if possible, or just extra */}
                <Option value="intense">Intense 🔥</Option>
                <Option value="emotional">Emotional 💖</Option>
                <Option value="dark">Dark 🌑</Option>
                <Option value="uplifting">Uplifting 🚀</Option>
                <Option value="funny">Funny 😂</Option>
                <Option value="thought-provoking">Thought-provoking 🧠</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="intent"
            label="Why do you consume this?"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder="Select reasons">
              <Option value="escapism">Escapism / Comfort</Option>
              <Option value="learning">Learning / Growth</Option>
              <Option value="social">Social Connection</Option>
              <Option value="challenge">Challenge / Mastery</Option>
              <Option value="inspiration">Inspiration</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 border-none hover:from-indigo-500 hover:to-violet-500"
            >
              Save Entry
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default function AddMediaPage() {
  return (
    <App>
      <AddMediaContent />
    </App>
  );
}
