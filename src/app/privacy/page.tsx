'use client';

import React from 'react';
import { Typography, Divider, Anchor, Card, Button } from 'antd';
import { SafetyCertificateOutlined, DatabaseOutlined, RobotOutlined, EyeOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;
const { Link } = Anchor;

const PrivacyPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white"> {/* Force white background */}
            <div className="max-w-5xl mx-auto py-12 px-6 flex gap-10">

                {/* Sidebar Navigation (Sticky) */}
                <div className="hidden md:block w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            className="mb-6 pl-0 hover:bg-transparent"
                            onClick={() => router.back()}
                        >
                            Back
                        </Button>

                        <Title level={5} className="mb-4 text-gray-400 uppercase tracking-wider text-xs">Contents</Title>
                        <Anchor
                            targetOffset={100}
                            items={[
                                { key: 'intro', href: '#intro', title: 'Introduction' },
                                { key: 'data-collection', href: '#data-collection', title: 'Data We Collect' },
                                { key: 'ai-transparency', href: '#ai-transparency', title: 'AI & Algorithms' },
                                { key: 'cookies', href: '#cookies', title: 'Cookies & Tracking' },
                                { key: 'rights', href: '#rights', title: 'Your Rights' },
                                { key: 'contact', href: '#contact', title: 'Contact' },
                            ]}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-12">

                    <section id="intro">
                        <div className="md:hidden mb-4">
                            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Back</Button>
                        </div>
                        <div className="mb-6">
                            <SafetyCertificateOutlined className="text-4xl text-indigo-600 mb-4" />
                            <Title level={1} className="!mb-2">Privacy Policy</Title>
                            <Text type="secondary" className="text-lg">Last Updated: November 2025</Text>
                        </div>
                        <Paragraph className="text-lg leading-relaxed text-gray-700">
                            MindMirror is built on a foundation of <strong>trust and transparency</strong>.
                            We believe your psychological data is sensitive and personal. This policy explains clearly what we collect, why we collect it, and how you stay in control.
                        </Paragraph>
                    </section>

                    <Divider />

                    <section id="data-collection">
                        <Title level={2}><DatabaseOutlined /> Data We Collect</Title>
                        <Paragraph>
                            We only collect data necessary to provide you with personalized psychological insights.
                        </Paragraph>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <Card title="Identity & Auth" size="small" className="bg-gray-50">
                                Email address, display name, and avatar (via Google Sign-In).
                            </Card>
                            <Card title="Psychological Input" size="small" className="bg-gray-50">
                                Quiz answers, mood logs, and journaling notes you explicitly enter.
                            </Card>
                            <Card title="Media History" size="small" className="bg-gray-50">
                                Titles and metadata of books, movies, and videos you add or import (e.g., YouTube subscriptions).
                            </Card>
                            <Card title="Derived Data" size="small" className="bg-gray-50">
                                Personality scores (OCEAN), archetypes, and AI-generated summaries derived from your inputs.
                            </Card>
                        </div>
                    </section>

                    <Divider />

                    <section id="ai-transparency">
                        <Title level={2}><RobotOutlined /> AI Transparency</Title>
                        <Paragraph>
                            MindMirror uses **Google Gemini** (an artificial intelligence model) to analyze your data. Here is the ethical breakdown:
                        </Paragraph>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                            <li><strong>Anonymized Processing:</strong> When we ask the AI for insights, we send only the necessary text (e.g., "User read 'Sapiens' and feels 'Curious'"). We do not send your email or unique ID to the AI training layer.</li>
                            <li><strong>No Training on Your Data:</strong> We rely on the public API guarantees of our AI partners, which state that API data is not used to train their foundation models.</li>
                            <li><strong>Probabilistic Nature:</strong> AI insights are estimates, not medical diagnoses. They reflect patterns in the data you provide.</li>
                        </ul>
                    </section>

                    <Divider />

                    <section id="cookies">
                        <Title level={2}><EyeOutlined /> Cookies & Tracking</Title>
                        <Paragraph>
                            We use cookies primarily for <strong>essential functionality</strong> (keeping you logged in).
                        </Paragraph>
                        <Paragraph>
                            We may use limited analytics cookies to understand aggregate usage patterns (e.g., "Which feature is most popular?").
                            You can opt-out of non-essential cookies via the consent banner at any time.
                        </Paragraph>
                    </section>

                    <Divider />

                    <section id="rights">
                        <Title level={2}><DeleteOutlined /> Your Rights</Title>
                        <Paragraph>
                            You have absolute control over your digital mind map.
                        </Paragraph>
                        <div className="space-y-4">
                            <div>
                                <Text strong>Export Data:</Text>
                                <Paragraph className="text-sm text-gray-600">Download a full JSON copy of your profile, media, and moods from Settings.</Paragraph>
                            </div>
                            <div>
                                <Text strong>Delete Account:</Text>
                                <Paragraph className="text-sm text-gray-600">Permanently erase your account and all associated data from our servers instantly.</Paragraph>
                            </div>
                            <div>
                                <Text strong>Public Visibility:</Text>
                                <Paragraph className="text-sm text-gray-600">Your profile is Private by default. You must explicitly enable "Public Profile" to share it.</Paragraph>
                            </div>
                        </div>
                    </section>

                    <Divider />

                    <section id="contact">
                        <Title level={2}>Contact Us</Title>
                        <Paragraph>
                            If you have questions about this policy or your data, please reach out.
                        </Paragraph>
                        <a href="mailto:privacy@brainmirror.app" className="text-indigo-600 font-medium hover:underline">privacy@brainmirror.app</a>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
