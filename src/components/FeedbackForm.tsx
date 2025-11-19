'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Rate, App } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const { TextArea } = Input;

const FeedbackForm = () => {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: any) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userEmail: user.email,
        type: values.type || 'general', // Default to 'general' if undefined
        message: values.message,
        rating: values.rating,
        createdAt: new Date().toISOString(),
      });
      message.success('Feedback sent! Thank you for helping us improve.');
      form.resetFields();
    } catch (error) {
      console.error("Feedback error:", error);
      message.error('Failed to send feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Share Your Feedback" className="mt-8 shadow-sm">
       <Form form={form} layout="vertical" onFinish={onFinish}>
         <Form.Item name="rating" label="How would you rate BrainMirror?" initialValue={5}>
            <Rate />
         </Form.Item>
         
         <Form.Item name="message" label="Your Message" rules={[{ required: true, message: 'Please tell us your thoughts!' }]}>
            <TextArea rows={4} placeholder="Feature requests, bugs, or just say hi..." />
         </Form.Item>

         <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submitting}>
               Send Feedback
            </Button>
         </Form.Item>
       </Form>
    </Card>
  );
};

export default FeedbackForm;

