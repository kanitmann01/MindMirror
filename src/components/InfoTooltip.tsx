'use client';

import React from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface InfoTooltipProps {
  text: string;
  title?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, title }) => {
  return (
    <Tooltip title={text} trigger={['hover', 'click']}>
      <span className="inline-flex items-center gap-1 cursor-help text-gray-400 hover:text-gray-600 ml-1 transition-colors">
        {title && <span className="text-xs underline decoration-dotted mr-1">{title}</span>}
        <InfoCircleOutlined style={{ fontSize: '14px' }} />
      </span>
    </Tooltip>
  );
};

export default InfoTooltip;

