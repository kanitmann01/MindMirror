import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Tag, Empty, Divider, Tooltip } from 'antd';
import { MedicineBoxOutlined, ThunderboltFilled, CoffeeOutlined, BulbOutlined, FireOutlined, ReloadOutlined } from '@ant-design/icons';
import { MediaItem } from '@/lib/firestoreUtils';
import { getRecommendationsForMood, Recommendation } from '@/lib/recommendationUtils';
import { MOOD_CONSTANTS } from '@/lib/psychologyUtils';

const { Title, Text } = Typography;

interface MoodPrescriptionProps {
    history: MediaItem[];
    currentMood?: string | null;
}

const TARGET_MOOD_OPTIONS = [
    { label: 'Focused', value: 'Focus', icon: <ThunderboltFilled />, color: 'blue' },
    { label: 'Relaxed', value: 'Relax', icon: <CoffeeOutlined />, color: 'purple' },
    { label: 'Inspired', value: 'Inspired', icon: <BulbOutlined />, color: 'gold' },
    { label: 'Challenged', value: 'Challenged', icon: <FireOutlined />, color: 'red' },
];

const MoodPrescription: React.FC<MoodPrescriptionProps> = ({ history, currentMood }) => {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
    const [suggestion, setSuggestion] = useState<string | null>(null);

    useEffect(() => {
        if (currentMood) {
            // Smart Suggestions based on Current Mood
            switch (currentMood) {
                case 'Anxious':
                    setSuggestion("Feeling Anxious? Try shifting to Relaxed.");
                    break;
                case 'Tired':
                    setSuggestion("Feeling Tired? Maybe get Inspired or Relaxed.");
                    break;
                case 'Sad':
                    setSuggestion("Feeling Sad? A little Inspiration might help.");
                    break;
                case 'Focused':
                    setSuggestion("You're Focused! Want to be Challenged?");
                    break;
                case 'Happy':
                    setSuggestion("Riding high? Stay Inspired!");
                    break;
                default:
                    setSuggestion(null);
            }
        } else {
            setSuggestion(null);
        }
    }, [currentMood]);

    const handlePrescribe = (mood: string) => {
        setSelectedMood(mood);
        const recs = getRecommendationsForMood(mood, history);
        // Pick the top one, or random from top 3 for variety
        if (recs.length > 0) {
            const top3 = recs.slice(0, 3);
            const randomChoice = top3[Math.floor(Math.random() * top3.length)];
            setRecommendation(randomChoice);
        } else {
            setRecommendation(null);
        }
    };

    return (
        <Card
            className="shadow-sm border-slate-100"
            title={
                <div className="flex items-center gap-2">
                    <MedicineBoxOutlined className="text-teal-500" />
                    <span>Mood Prescription</span>
                </div>
            }
        >
            <div className="text-center mb-6">
                {suggestion ? (
                    <Text type="secondary" className="block mb-3 italic text-indigo-500 animate-pulse">
                        {suggestion}
                    </Text>
                ) : (
                    <Text type="secondary" className="block mb-3">I want to feel...</Text>
                )}
                
                <div className="flex flex-wrap justify-center gap-2">
                    {TARGET_MOOD_OPTIONS.map(option => (
                        <Button
                            key={option.value}
                            type={selectedMood === option.value ? 'primary' : 'default'}
                            icon={option.icon}
                            onClick={() => handlePrescribe(option.value)}
                            className={`rounded-full transition-all duration-300 ${selectedMood === option.value ? `bg-${option.color}-500 border-${option.color}-500 shadow-md scale-105` : ''}`}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {selectedMood && (
                <div className="animate-fadeIn">
                    <Divider className="my-4" />
                    {recommendation ? (
                        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-teal-200 text-teal-800 text-xs font-bold px-2 py-1 rounded-bl-lg">
                                Rx
                            </div>

                            <Text type="secondary" className="text-xs uppercase font-bold tracking-wider mb-1 block">
                                Prescribed for {selectedMood}
                            </Text>

                            <Title level={4} className="!mb-1 !mt-0 text-teal-900">
                                {recommendation.item.title}
                            </Title>

                            <div className="flex gap-2 mb-3">
                                <Tag color="cyan" className="m-0">{recommendation.item.category}</Tag>
                                {recommendation.reason && (
                                    <Tag color="blue" className="m-0">Because: {recommendation.reason}</Tag>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <Text className="text-teal-700 text-sm italic">
                                    "Based on your history, this works for you."
                                </Text>
                                <Button
                                    size="small"
                                    icon={<ReloadOutlined />}
                                    onClick={() => handlePrescribe(selectedMood)}
                                    type="text"
                                >
                                    Shuffle
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Empty description="No prescription available yet. Log more items!" />
                    )}
                </div>
            )}
        </Card>
    );
};

export default MoodPrescription;
