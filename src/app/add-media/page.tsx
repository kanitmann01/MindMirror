'use client';

import React, { useState } from 'react';
import { Form, Input, Select, Rate, Button, Card, Typography, App } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { addMediaItem, MediaItem, getUserProfile, saveUserProfile } from '@/lib/firestoreUtils';
import { updateScoresWithMedia, determineArchetype } from '@/lib/psychologyUtils';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Option } = Select;

const AddMediaContent = () => {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
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
        
        await saveUserProfile(user.uid, {
          oceanScore: updatedScores,
          archetype: updatedArchetype,
        });
      }
      
      message.success('Media added and profile updated!');
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
            label="Impact Rating"
            help="How much did this affect you emotionally?"
          >
            <Rate allowHalf />
          </Form.Item>

          <Form.Item
            name="mood"
            label="Mood / Vibe"
            rules={[{ required: true, message: 'Please select the primary mood' }]}
          >
             <Select mode="tags" placeholder="Select or type moods">
               <Option value="relaxing">Relaxing / Chill</Option>
               <Option value="intense">Intense / Thrilling</Option>
               <Option value="emotional">Emotional / Touching</Option>
               <Option value="dark">Dark / Melancholic</Option>
               <Option value="uplifting">Uplifting / Inspiring</Option>
               <Option value="funny">Funny / Lighthearted</Option>
               <Option value="thought-provoking">Thought-provoking</Option>
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
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Add to Mind Map
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
