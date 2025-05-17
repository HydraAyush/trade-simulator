import React from 'react';

export type TimePeriod = '7d' | '14d' | '30d' | '90d';

interface TimeFilterProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '14d', label: '14 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Time Period:</span>
      <div className="flex rounded-md shadow-sm">
        {periods.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onPeriodChange(value)}
            className={`
              px-4 py-2 text-sm font-medium
              ${
                selectedPeriod === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }
              ${value === '7d' ? 'rounded-l-md' : ''}
              ${value === '90d' ? 'rounded-r-md' : ''}
              border border-gray-300
              focus:outline-none focus:ring-1 focus:ring-indigo-500
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeFilter; 