'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

const OnboardingPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/quiz');
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <Spin size="large" tip="Redirecting to new experience..." />
    </div>
  );
};

export default OnboardingPage;
