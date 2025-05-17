import React from 'react';

interface SimulationResult {
  slippage: number;
  fee: number;
  impact: number;
  netCost: number;
  makerTakerProbability: {
    maker: number;
    taker: number;
  };
  latency: number;
}

interface OutputPanelProps {
  result: SimulationResult | null;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 text-lg">Run a simulation to see results</p>
        <p className="text-gray-400 text-sm mt-2">Configure parameters and click "Run Simulation"</p>
      </div>
    );
  }

  const getValueColor = (value: number, isPercentage = true, isLatency = false) => {
    if (isLatency) {
      return value < 50 ? 'text-green-600' : value < 100 ? 'text-yellow-600' : 'text-red-600';
    }
    const percentValue = isPercentage ? value * 100 : value;
    return percentValue < 0.1 ? 'text-green-600' : percentValue < 0.5 ? 'text-yellow-600' : 'text-red-600';
  };

  const metrics = [
    {
      label: 'Expected Slippage',
      value: `${(result.slippage * 100).toFixed(4)}%`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: getValueColor(result.slippage)
    },
    {
      label: 'Expected Fee',
      value: `${(result.fee * 100).toFixed(4)}%`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: getValueColor(result.fee)
    },
    {
      label: 'Market Impact',
      value: `${(result.impact * 100).toFixed(4)}%`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: getValueColor(result.impact)
    },
    {
      label: 'Net Cost',
      value: `${result.netCost.toFixed(2)} USD`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-blue-600'
    },
    {
      label: 'Maker/Taker Split',
      value: (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${result.makerTakerProbability.maker * 100}%` }}
            />
          </div>
          <span className="text-sm">
            {(result.makerTakerProbability.maker * 100).toFixed(0)}% / {(result.makerTakerProbability.taker * 100).toFixed(0)}%
          </span>
        </div>
      ),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'text-gray-900'
    },
    {
      label: 'Internal Latency',
      value: `${result.latency.toFixed(2)}ms`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: getValueColor(result.latency, false, true)
    },
  ];

  return (
    <div className="grid gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-gray-400">{metric.icon}</div>
              <label className="text-sm font-medium text-gray-600">
                {metric.label}
              </label>
            </div>
            <div className={`text-lg font-semibold ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OutputPanel; 