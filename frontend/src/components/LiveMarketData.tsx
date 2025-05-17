import React, { useEffect, useState, useCallback } from 'react';

interface MarketTicker {
  price: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  change24h: number;
}

interface Trade {
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

const LiveMarketData: React.FC = () => {
  const [ticker, setTicker] = useState<MarketTicker | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:5000/ws/market-data');

    ws.onopen = () => {
      console.log('Connected to market data WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'ticker') {
        setLastPrice(ticker?.price || null);
        setTicker({
          price: data.price,
          high24h: data.high24h,
          low24h: data.low24h,
          volume24h: data.volume24h,
          change24h: data.change24h,
        });
      } else if (data.type === 'trade') {
        setRecentTrades(prev => [
          {
            price: data.price,
            size: data.size,
            side: data.side,
            timestamp: data.timestamp,
          },
          ...prev.slice(0, 9), // Keep only last 10 trades
        ]);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from market data WebSocket');
      setIsConnected(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [ticker]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket]);

  const formatPrice = (price: number) => `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${(change * 100).toFixed(2)}%`;
  };

  const getPriceChangeClass = (current: number, last: number | null) => {
    if (!last) return '';
    return current > last ? 'animate-price-up' : current < last ? 'animate-price-down' : '';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-900">Live Market Data</h2>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {ticker && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6">
          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
            <div className="text-sm font-medium text-gray-500 mb-1">Price</div>
            <div className={`text-2xl font-bold ${getPriceChangeClass(ticker.price, lastPrice)}`}>
              {formatPrice(ticker.price)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
            <div className="text-sm font-medium text-gray-500 mb-1">24h Change</div>
            <div className={`text-2xl font-bold ${ticker.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatChange(ticker.change24h)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
            <div className="text-sm font-medium text-gray-500 mb-1">24h Volume</div>
            <div className="text-2xl font-bold text-gray-900">
              {ticker.volume24h.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
            <div className="text-sm font-medium text-gray-500 mb-1">24h High</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(ticker.high24h)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
            <div className="text-sm font-medium text-gray-500 mb-1">24h Low</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(ticker.low24h)}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 pt-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Trades</h3>
          <div className="text-sm text-gray-500">Last 10 trades</div>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTrades.map((trade, index) => (
                <tr 
                  key={index}
                  className={`${index === 0 ? 'animate-fade-in' : ''} hover:bg-gray-50 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trade.side === 'buy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(trade.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trade.size.toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentTrades.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-sm text-gray-500 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Waiting for trades...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveMarketData; 