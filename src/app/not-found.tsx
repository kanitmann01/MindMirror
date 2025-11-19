'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist or has been moved."
        extra={
          <Button type="primary" onClick={() => router.push('/')}>
            Back Home
          </Button>
        }
      />
    </div>
  );
}

