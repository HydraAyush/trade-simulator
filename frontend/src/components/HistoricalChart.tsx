import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import TimeFilter, { TimePeriod } from './TimeFilter';

export interface HistoricalDataPoint {
  timestamp: string;
  slippage: number;
  impact: number;
  volume: number;
}

interface HistoricalChartProps {
  data: HistoricalDataPoint[];
}

interface MetricToggle {
  key: keyof Omit<HistoricalDataPoint, 'timestamp'>;
  label: string;
  color: string;
  enabled: boolean;
  axis: 'left' | 'right';
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data }) => {
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [metrics, setMetrics] = useState<MetricToggle[]>([
    { key: 'slippage', label: 'Slippage %', color: '#8884d8', enabled: true, axis: 'left' },
    { key: 'impact', label: 'Market Impact %', color: '#82ca9d', enabled: true, axis: 'left' },
    { key: 'volume', label: 'Volume', color: '#ffc658', enabled: true, axis: 'right' },
  ]);
  const [zoomArea, setZoomArea] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });

  // Filter data based on selected time period
  const filteredData = data.slice(-parseInt(period));

  // Toggle metric visibility
  const handleMetricToggle = (index: number) => {
    setMetrics(prev =>
      prev.map((metric, i) =>
        i === index ? { ...metric, enabled: !metric.enabled } : metric
      )
    );
  };

  // Reset zoom
  const handleResetZoom = () => {
    setZoomArea({ start: null, end: null });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Historical Analysis</h2>
        <button
          onClick={handleResetZoom}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Reset Zoom
        </button>
      </div>

      <TimeFilter selectedPeriod={period} onPeriodChange={setPeriod} />

      <div className="flex flex-wrap gap-4 mb-4">
        {metrics.map((metric, index) => (
          <button
            key={metric.key}
            onClick={() => handleMetricToggle(index)}
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${metric.enabled ? 'bg-gray-200' : 'bg-gray-100'}
              hover:bg-gray-300 transition-colors
            `}
            style={{ borderLeft: `4px solid ${metric.color}` }}
          >
            {metric.label}
          </button>
        ))}
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseDown={(e) => e?.activeLabel && setZoomArea({ ...zoomArea, start: e.activeLabel || null })}
            onMouseMove={(e) => e?.activeLabel && zoomArea.start && setZoomArea({ ...zoomArea, end: e.activeLabel || null })}
            onMouseUp={() => {
              if (zoomArea.start && zoomArea.end) {
                // Here you could implement zoom functionality
                // For now, we'll just reset it
                setZoomArea({ start: null, end: null });
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Volume', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value: number, name: string) => [
                value.toFixed(4),
                name.replace(' %', '')
              ]}
            />
            <Legend />

            {metrics.map(metric => 
              metric.enabled && (
                <Line
                  key={metric.key}
                  yAxisId={metric.axis}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  name={metric.label}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )
            )}

            {zoomArea.start && zoomArea.end && (
              <ReferenceArea
                yAxisId="left"
                x1={zoomArea.start}
                x2={zoomArea.end}
                strokeOpacity={0.3}
                fill="#8884d8"
                fillOpacity={0.1}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalChart; 