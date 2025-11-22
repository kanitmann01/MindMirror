'use client';

import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Tooltip, Badge, App } from 'antd';
import { FireFilled } from '@ant-design/icons';

const StreakCounter = () => {
    const { user } = useAuth();
    const { message } = App.useApp();
    const [streak, setStreak] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setStreak(0);
            setLoading(false);
            return;
        }

        const userRef = doc(db, 'users', user.uid);

        // Real-time listener for streak updates
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const newStreak = data.currentStreak || 0;

                // Optional: Detect increase and show toast (handled here or in the action?)
                // The prompt asked for a toast when saving, but the listener is a good backup.
                // Let's just display the value for now.
                setStreak(newStreak);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to streak:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading || streak === 0) return null;

    return (
        <Tooltip title={`You're on a ${streak}-day streak! Keep it up!`}>
            <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 cursor-help transition-all hover:bg-orange-100">
                <FireFilled className="text-orange-500 animate-pulse" />
                <span className="font-bold text-orange-600">{streak}</span>
            </div>
        </Tooltip>
    );
};

export default StreakCounter;
