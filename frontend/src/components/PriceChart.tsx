import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface PriceDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  data: PriceDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-gray-500 mb-2">{new Date(label).toLocaleString()}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <span className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name === 'Volume' 
                ? entry.value.toLocaleString()
                : `$${entry.value.toFixed(2)}`
              }
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState('all');

  const timeRanges = [
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' },
    { value: 'all', label: 'All' },
  ];

  const filterData = (range: string) => {
    const now = new Date();
    const filtered = data.filter(point => {
      const pointDate = new Date(point.timestamp);
      switch (range) {
        case '1d':
          return now.getTime() - pointDate.getTime() <= 24 * 60 * 60 * 1000;
        case '1w':
          return now.getTime() - pointDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        case '1m':
          return now.getTime() - pointDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredData = filterData(timeRange);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Price History</h2>
        <div className="flex space-x-2">
          {timeRanges.map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                timeRange === range.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {/* Price Chart */}
        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
              />
              <YAxis
                domain={['dataMin', 'dataMax']}
                label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '10px',
                }}
              />
              
              <Line
                type="monotone"
                dataKey="high"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="High"
                activeDot={{ r: 4, fill: '#10B981' }}
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="#6366F1"
                strokeWidth={2}
                dot={false}
                name="Low"
                activeDot={{ r: 4, fill: '#6366F1' }}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                name="Close"
                activeDot={{ r: 4, fill: '#F59E0B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
              />
              <YAxis
                label={{ value: 'Volume', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '10px',
                }}
              />
              <Bar
                dataKey="volume"
                fill="#818CF8"
                opacity={0.8}
                name="Volume"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PriceChart; 