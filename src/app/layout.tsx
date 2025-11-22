import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import theme from '@/theme/themeConfig';
import { AuthProvider } from '@/context/AuthContext';
import CookieConsent from '@/components/CookieConsent';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6B7FD7',
};

export const metadata: Metadata = {
  title: "MindMirror | Discover Your Psychological DNA",
  description: "Visualize your mind's patterns, strengths, and blind spots through advanced psychological profiling and media analysis.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "MindMirror | Discover Your Psychological DNA",
    description: "Visualize your mind's patterns, strengths, and blind spots.",
    url: 'https://brainmirror.app', // Placeholder
    siteName: 'MindMirror',
    images: [
      {
        url: '/og-image.png', // Placeholder
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <App>
              <AuthProvider>
                {children}
                <CookieConsent />
              </AuthProvider>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
