'use client';

import React from 'react';
import { Button, Result } from 'antd';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Result
            status="500"
            title="Critical Error"
            subTitle="A critical system error occurred. Please refresh the page."
            extra={
              <Button type="primary" onClick={() => reset()}>
                Try Again
              </Button>
            }
          />
        </div>
      </body>
    </html>
  );
}

