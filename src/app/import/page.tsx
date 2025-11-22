'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, App, Typography, Modal } from 'antd';
import { YoutubeOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { addMediaItem, getUserProfile, saveUserProfile } from '@/lib/firestoreUtils';
import { updateScoresWithMedia, determineArchetype, analyzeMediaContent } from '@/lib/psychologyUtils';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

const ImportContent = () => {
  const { message } = App.useApp();
  const { user } = useAuth();
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(profile => {
        if (profile?.youtubeImported) {
          setIsImported(true);
        }
      });
    }
  }, [user]);

  const handleYouTubeImport = async () => {
    if (!user) return;
    setImporting(true);

    try {
      // 1. Request YouTube Scopes via Firebase Auth
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/youtube.readonly');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error("No access token granted.");
      }

      // 2. Fetch YouTube Data (Subscriptions)
      const response = await fetch('https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error?.message || "Failed to fetch YouTube data.");
      }

      const data = await response.json();

      // 3. Process & Save to Firestore
      const newMediaItems: any[] = [];

      // Limit to top 10 channels to avoid hitting API quotas too hard
      const topChannels = data.items.slice(0, 10);

      for (const item of topChannels) {
        const channelId = item.snippet.resourceId.channelId;

        // 3a. Get Channel Details to find "Uploads" playlist
        const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!channelResponse.ok) continue;
        const channelData = await channelResponse.json();
        const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (uploadsPlaylistId) {
          // 3b. Get Recent Videos from Uploads Playlist
          const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (videosResponse.ok) {
            const videosData = await videosResponse.json();

            for (const video of videosData.items) {
              const title = video.snippet.title;
              const description = video.snippet.description;
              const { mood, intent } = analyzeMediaContent(title, description);

              // Skip generic/private videos
              if (title === 'Private video' || title === 'Deleted video') continue;

              const mediaItem = {
                title: title,
                category: 'youtube' as const,
                rating: 4,
                mood: mood,
                intent: intent,
                tags: [item.snippet.title], // Add channel name as tag
                userId: user.uid,
                createdAt: video.snippet.publishedAt || new Date().toISOString() // Use actual video date
              };

              await addMediaItem(user.uid, mediaItem);
              newMediaItems.push(mediaItem);
            }
          }
        }
      }

      // 4. UPDATE USER PERSONALITY PROFILE
      const profile = await getUserProfile(user.uid);
      const updatedScores = profile?.oceanScore
        ? updateScoresWithMedia(profile.oceanScore, newMediaItems)
        : updateScoresWithMedia({ openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 }, newMediaItems);

      const updatedArchetype = determineArchetype(updatedScores);

      await saveUserProfile(user.uid, {
        oceanScore: updatedScores,
        archetype: updatedArchetype,
        youtubeImported: true, // Mark as imported
      });

      message.success(`Imported ${newMediaItems.length} channels! Redirecting to dashboard...`);
      setIsImported(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error(error);
      message.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white/90 p-6 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto mt-8">
        <Card title="Import Data Sources" className="bg-white/80 backdrop-blur-md shadow-xl border border-white/50">
        <Paragraph>
          Connect your external accounts to automatically populate your MindMirror.
          <strong> Your personality profile will evolve based on your consumption patterns.</strong>
        </Paragraph>

        <div className="flex flex-col gap-4">
          <Button
            type={isImported ? 'default' : 'primary'}
            danger={!isImported}
            icon={isImported ? <CheckCircleOutlined /> : <YoutubeOutlined />}
            size="large"
            onClick={handleYouTubeImport}
            loading={importing}
            disabled={isImported}
            className={isImported ? 'bg-gray-100 text-gray-400 border-gray-200' : ''}
          >
            {isImported ? 'YouTube Data Imported' : 'Import from YouTube'}
          </Button>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <SafetyOutlined /> We only read your public subscriptions. No write access.
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default function ImportPage() {
  return (
    <App>
      <ImportContent />
    </App>
  );
}
