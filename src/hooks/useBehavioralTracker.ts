import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, saveUserProfile } from '@/lib/firestoreUtils';
import { mapBehaviorToTraitUpdate, updateScoresWithBehavior, BehavioralMetrics } from '@/lib/psychologyUtils';

export const useBehavioralTracker = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Accumulate data in refs to avoid re-renders
  const routes = useRef(new Set<string>());
  const scrollSamples = useRef<number[]>([]); // pixels/sec samples
  const hesitationSamples = useRef<number[]>([]); // ms samples
  
  const lastScroll = useRef<{ pos: number; time: number } | null>(null);
  const lastMouseMove = useRef<number>(Date.now());

  // Track Routes
  useEffect(() => {
    if (pathname) {
      routes.current.add(pathname);
    }
  }, [pathname]);

  // Track Scroll Speed
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const currentPos = window.scrollY;

      if (lastScroll.current) {
        const timeDiff = now - lastScroll.current.time;
        const distDiff = Math.abs(currentPos - lastScroll.current.pos);

        if (timeDiff > 50 && timeDiff < 500) { // Only count continuous scroll bursts
          const speed = (distDiff / timeDiff) * 1000; // pixels per second
          scrollSamples.current.push(speed);
        }
      }

      lastScroll.current = { pos: currentPos, time: now };
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track Click Hesitation
  useEffect(() => {
    const handleMouseMove = () => {
      lastMouseMove.current = Date.now();
    };

    const handleClick = () => {
      const now = Date.now();
      const hesitation = now - lastMouseMove.current;
      
      // Filter out unrealistic values (e.g. > 10s idle time)
      if (hesitation < 5000) {
        hesitationSamples.current.push(hesitation);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick); // Capture all clicks

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // Periodic Sync to Profile (every 2 minutes)
  useEffect(() => {
    if (!user) return;

    const syncInterval = setInterval(async () => {
      // Calculate Averages
      const avgScrollSpeed = scrollSamples.current.length > 0 
        ? scrollSamples.current.reduce((a, b) => a + b, 0) / scrollSamples.current.length 
        : 0;

      const avgClickHesitation = hesitationSamples.current.length > 0
        ? hesitationSamples.current.reduce((a, b) => a + b, 0) / hesitationSamples.current.length
        : 0;
      
      const uniqueRoutesVisited = routes.current.size;

      // Only update if we have meaningful data
      if (scrollSamples.current.length < 5 && hesitationSamples.current.length < 2 && uniqueRoutesVisited < 2) {
        return; 
      }

      const metrics: BehavioralMetrics = {
        avgScrollSpeed,
        avgClickHesitation,
        uniqueRoutesVisited
      };

      try {
        const observations = mapBehaviorToTraitUpdate(metrics);
        if (observations.length === 0) return;

        const profile = await getUserProfile(user.uid);
        if (profile && profile.oceanScore) {
          const updatedScores = updateScoresWithBehavior(profile.oceanScore, observations);
          
          await saveUserProfile(user.uid, {
            oceanScore: updatedScores,
            // Optionally update a "lastBehavioralSync" field if we wanted to be robust
          });
          
          console.log('Behavioral traits updated:', observations);
          
          // Clear accumulators after successful sync to start fresh for next window
          scrollSamples.current = [];
          hesitationSamples.current = [];
          // Keep routes? Or clear? Maybe keep routes but count is cumulative? 
          // Logic says "Exploration" is about visiting *many* pages. 
          // If we clear, we test "rate of exploration". If we keep, we test "total exploration".
          // "Visiting many pages" implies total. But we don't want to reinforce Openness infinite times for the same 5 pages.
          // Let's clear route count to measure "active exploration in this session window".
          routes.current.clear();
          if (pathname) routes.current.add(pathname);
        }
      } catch (error) {
        console.error("Failed to sync behavioral metrics:", error);
      }

    }, 120000); // 2 minutes

    return () => clearInterval(syncInterval);
  }, [user, pathname]); // Re-bind if user changes, pathname dependency just for closure freshness if needed (not really needed due to refs)
};

