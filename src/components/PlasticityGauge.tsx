import React from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface PlasticityGaugeProps {
  variance: number;
}

const PlasticityGauge: React.FC<PlasticityGaugeProps> = ({ variance }) => {
  // Determine state based on variance thresholds
  let state: 'high' | 'low' | 'balanced' = 'balanced';
  if (variance > 200) state = 'high';
  else if (variance < 50) state = 'low';

  const getTooltipText = () => {
    switch (state) {
      case 'high': return 'High Plasticity means you are adapting.';
      case 'low': return 'Low Plasticity means you have mastered this trait.';
      default: return 'Balanced plasticity allows for stability and adaptation.';
    }
  };

  const getLabelText = () => {
    switch (state) {
      case 'high': return 'State: Fluid (Synaptic Growth)';
      case 'low': return 'State: Fixed (Stable Circuit)';
      default: return 'State: Balanced (Flexible)';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-gray-100 rounded-xl shadow-sm bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background Effects */}
        {state === 'high' && (
           <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 blur-xl animate-pulse opacity-50" />
        )}
        
        {/* Main Visual Element */}
        <div 
            className={`
                relative w-20 h-20 transition-all duration-1000 ease-in-out flex items-center justify-center shadow-inner
                ${state === 'high' ? 'rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 animate-[pulse_3s_ease-in-out_infinite]' : ''}
                ${state === 'low' ? 'bg-gradient-to-br from-blue-600 to-cyan-700 shadow-lg' : ''}
                ${state === 'balanced' ? 'rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 rotate-3' : ''}
            `}
            style={{
                // Hexagon clip-path for crystal structure
                clipPath: state === 'low' ? 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' : undefined,
            }}
        >
            {/* Inner details for visual texture */}
             <div className="absolute inset-0 bg-white/20" 
                style={{
                    clipPath: state === 'low' ? 'polygon(50% 0%, 50% 50%, 95% 25%)' : undefined
                }}
             />
             {state === 'low' && (
                <div className="absolute inset-0 bg-black/10" 
                    style={{
                        clipPath: 'polygon(50% 50%, 5% 75%, 50% 100%)'
                    }}
                />
             )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${
                state === 'high' ? 'text-purple-600' : 
                state === 'low' ? 'text-blue-700' : 'text-teal-600'
            }`}>
                {getLabelText()}
            </span>
            <Tooltip title={getTooltipText()} placement="top">
                <InfoCircleOutlined className="text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
            </Tooltip>
        </div>
        
        <div className="text-xs text-gray-500 font-mono">
           Variance: {variance.toFixed(0)}
        </div>
      </div>
    </div>
  );
};

export default PlasticityGauge;

