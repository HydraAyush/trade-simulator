import React, { useState, useEffect } from 'react';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import HistoricalChart from './components/HistoricalChart';
import PriceChart from './components/PriceChart';
import LiveMarketData from './components/LiveMarketData';
import { SimulationResult, SimulationParams } from './types';
import { simulateTrade, getHistoricalData, getPriceHistory } from './services/api';
import ErrorAlert from './components/ErrorAlert';
import LoadingSpinner from './components/LoadingSpinner';
import { HistoricalDataPoint } from './components/HistoricalChart';
import { PriceDataPoint } from './components/PriceChart';

function App() {
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period] = useState<string>('30d');

  useEffect(() => {
    const loadData = async () => {
      try {
        const days = parseInt(period);
        const [histData, priceHistData] = await Promise.all([
          getHistoricalData(days),
          getPriceHistory(days)
        ]);
        setHistoricalData(histData);
        setPriceData(priceHistData);
      } catch (err) {
        console.error('Failed to load data:', err);
        // Don't show error for data load failure
      }
    };
    loadData();
  }, [period]);

  const handleSimulate = async (params: SimulationParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await simulateTrade(params);
      if ('error' in data) {
        setError(data.error as string);
        setSimulationResult(null);
      } else {
        setSimulationResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simulate trade. Please try again.');
      setSimulationResult(null);
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Trade Simulator
          </h1>
          <div className="text-sm text-gray-500">Real-time Market Analysis</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onClose={() => setError(null)} />
          </div>
        )}

        <div className="grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Simulation Parameters</h2>
              <InputPanel onSimulate={handleSimulate} disabled={loading} />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Simulation Results</h2>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
              ) : (
                <OutputPanel result={simulationResult} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Live Market Data</h2>
            <LiveMarketData />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Price History</h2>
              <PriceChart data={priceData} />
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Historical Performance</h2>
              <HistoricalChart data={historicalData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 