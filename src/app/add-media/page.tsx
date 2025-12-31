'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Form, Select, Rate, Button, Card, Typography, App, AutoComplete, Radio, Tag, Space, Spin, message } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { addMediaItem, MediaItem, getUserProfile, saveUserProfile } from '@/lib/firestoreUtils';
import { updateScoresWithMedia, determineArchetype } from '@/lib/psychologyUtils';
import { checkSignificantShift } from '@/lib/gamificationUtils';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

// --- Mock Search Service (Replace with Real API) ---
interface SearchResult {
  value: string;
  label: string;
  category: string;
  cover: string;
}

const MOCK_DB: SearchResult[] = [
  { value: 'Dune', label: 'Dune (Book)', category: 'book', cover: 'https://upload.wikimedia.org/wikipedia/en/d/de/Dune-Frank_Herbert_%281965%29_First_Edition.jpg' },
  { value: 'Inception', label: 'Inception (Movie)', category: 'movie', cover: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg' },
  { value: 'The Dark Side of the Moon', label: 'The Dark Side of the Moon (Album)', category: 'spotify', cover: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png' },
  { value: 'Elden Ring', label: 'Elden Ring (Game)', category: 'game', cover: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg' },
  { value: 'Atomic Habits', label: 'Atomic Habits (Book)', category: 'book', cover: 'https://m.media-amazon.com/images/I/91bYsX41DVL.jpg' },
  { value: 'Spirited Away', label: 'Spirited Away (Anime)', category: 'anime', cover: 'https://upload.wikimedia.org/wikipedia/en/d/db/Spirited_Away_Japanese_poster.png' },
];

const AddMediaContent: React.FC = () => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [extractedThemes, setExtractedThemes] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  
  const { message } = App.useApp();
  const router = useRouter();
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Debounced Search Handler
  const handleSearch = (value: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!value) {
      setOptions([]);
      return;
    }
    // Simulate API delay
    searchTimeout.current = setTimeout(() => {
      const results = MOCK_DB.filter(item => item.value.toLowerCase().includes(value.toLowerCase()));
      setOptions(results.length > 0 ? results : [{ value, label: value }]); // Allow custom input
    }, 300);
  };

  const handleSelect = async (value: string) => {
    const item = MOCK_DB.find(i => i.value === value);
    if (item) {
      setSelectedItem(item);
      form.setFieldsValue({ category: item.category, title: item.value });
      
      // Trigger Gemini Analysis
      analyzeThemes(item.value, item.category);
    } else {
      // Custom item
      setSelectedItem({ value, label: value, category: 'book', cover: 'https://placehold.co/400x600?text=No+Cover' }); // Default cover
      analyzeThemes(value, 'media');
    }
  };

  const analyzeThemes = async (title: string, category: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/extract-themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category }),
      });
      const data = await response.json();
      if (data.themes) {
        setExtractedThemes(data.themes);
        message.success(`AI Identified Themes: ${data.themes.join(', ')}`);
      }
    } catch (error) {
      console.error("Theme extraction failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const mediaItem: MediaItem = {
        userId: user.uid,
        title: values.title,
        category: values.category,
        rating: values.rating,
        intent: values.intent,
        mood: values.mood,
        consumptionStyle: values.consumptionStyle,
        themes: extractedThemes,
        tags: [],
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
      setSelectedItem(null);
      setExtractedThemes([]);
    } catch (error) {
      console.error(error);
      message.error('Failed to add media.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Cover Art & AI Insights */}
        <div className="md:col-span-1 space-y-4">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key="cover"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="rounded-lg overflow-hidden shadow-xl"
              >
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedItem.cover} 
                  alt={selectedItem.value} 
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
              >
                <Text type="secondary">Select media to see preview</Text>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Themes Display */}
          <Card size="small" title="🔮 AI Analysis" className="shadow-sm">
             {analyzing ? (
               <div className="flex justify-center p-4"><Spin /></div>
             ) : extractedThemes.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {extractedThemes.map(theme => (
                   <Tag color="purple" key={theme}>{theme}</Tag>
                 ))}
               </div>
             ) : (
               <Text type="secondary" className="text-xs">Select media to generate psychological themes...</Text>
             )}
          </Card>
        </div>

        {/* Right Column: Input Form */}
        <div className="md:col-span-2">
          <Card className="shadow-md">
            <Title level={2} className="mb-6">Log Consumption</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                rating: 3,
                category: 'book',
                consumptionStyle: 'deep_dive'
              }}
            >
              <Form.Item
                name="title"
                label="Search Media"
                rules={[{ required: true, message: 'Please select a title' }]}
              >
                <AutoComplete
                  options={options}
                  onSearch={handleSearch}
                  onSelect={handleSelect}
                  placeholder="Search for Book, Movie, Song..."
                  size="large"
                />
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
                  <Option value="youtube">YouTube</Option>
                  <Option value="spotify">Spotify</Option>
                </Select>
              </Form.Item>

              {/* Digital Phenotyping Section */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                <Text strong className="block mb-3">🧠 Consumption Style (Digital Phenotyping)</Text>
                <Form.Item
                  name="consumptionStyle"
                  noStyle
                  rules={[{ required: true }]}
                >
                  <Radio.Group buttonStyle="solid" className="w-full flex">
                    <Radio.Button value="deep_dive" className="flex-1 text-center">
                      Deep Dive <span className="block text-xs text-gray-400">Active Learning</span>
                    </Radio.Button>
                    <Radio.Button value="binge" className="flex-1 text-center">
                      Binge <span className="block text-xs text-gray-400">Passive Flow</span>
                    </Radio.Button>
                    <Radio.Button value="background" className="flex-1 text-center">
                      Background <span className="block text-xs text-gray-400">Multitasking</span>
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </div>

              <Form.Item
                name="rating"
                label="Psychological Intensity"
              >
                <Rate allowHalf />
              </Form.Item>

              <Form.Item
                name="mood"
                label="Mood / Vibe"
                rules={[{ required: true, message: 'Please select mood' }]}
              >
                <Select mode="tags" placeholder="Select moods">
                    <Option value="Happy">Happy ☀️</Option>
                    <Option value="Focused">Focused 🎯</Option>
                    <Option value="Calm">Calm 🍃</Option>
                    <Option value="Anxious">Anxious ⚡</Option>
                    <Option value="Sad">Sad 🌧️</Option>
                    <Option value="intense">Intense 🔥</Option>
                    <Option value="thought-provoking">Thought-provoking 🧠</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="intent"
                label="Intent"
                rules={[{ required: true }]}
              >
                <Select mode="multiple" placeholder="Why did you consume this?">
                  <Option value="escapism">Escapism</Option>
                  <Option value="learning">Learning</Option>
                  <Option value="social">Social</Option>
                  <Option value="challenge">Challenge</Option>
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
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 border-none hover:from-indigo-500 hover:to-violet-500 h-12 text-lg"
                >
                  Save to Mind Map
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
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
