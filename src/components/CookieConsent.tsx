'use client';

import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
    message.success("Preferences saved!");
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setIsVisible(false);
    message.info("Non-essential cookies disabled.");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 z-50 shadow-lg border-t border-gray-700">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm">
          <strong className="block text-lg mb-1">We value your privacy.</strong>
          <p className="text-gray-300">
            BrainMirror uses essential cookies to ensure secure logins. 
            We also use analytics to improve the AI experience, but only with your permission. 
            See our <a href="/privacy" className="underline text-blue-400 hover:text-blue-300">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button ghost onClick={handleReject}>
            Reject Non-Essential
          </Button>
          <Button type="primary" onClick={handleAccept}>
            Accept All
          </Button>
          <Button type="text" icon={<CloseOutlined />} className="text-gray-400 hover:text-white" onClick={() => setIsVisible(false)} />
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

