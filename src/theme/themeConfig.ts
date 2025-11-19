import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: '#6B7FD7', // Soft Purple/Blue
    colorSuccess: '#52C41A', // Mint Green
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    colorInfo: '#1890FF',
    colorBgBase: '#ffffff',
    colorTextBase: '#2c3e50', // Dark Slate
    fontFamily: 'var(--font-geist-sans)',
    borderRadius: 8,
  },
  components: {
    Button: {
      algorithm: true, // Enable default algorithm
    },
    Layout: {
      headerBg: '#ffffff',
      bodyBg: '#f0f2f5',
    },
  },
};

export default theme;
