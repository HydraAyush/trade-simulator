import React, { useState, useEffect } from 'react';
import { SimulationParams } from '../types';
import { getAvailableAssets } from '../services/api';

interface InputPanelProps {
  onSimulate: (params: SimulationParams) => void;
  disabled?: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({ onSimulate, disabled = false }) => {
  const [formData, setFormData] = useState<SimulationParams>({
    asset: 'BTC-USDT-SWAP',
    quantity: 100,
    volatility: 0.5,
    feeTier: 'VIP1'
  });

  const [assets, setAssets] = useState<string[]>([]);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const availableAssets = await getAvailableAssets();
        setAssets(availableAssets);
      } catch (error) {
        console.error('Failed to load assets:', error);
        setAssets(['BTC-USDT-SWAP']); // Fallback
      }
    };
    loadAssets();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Exchange */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exchange
            <span className="ml-1 text-xs text-gray-500">(Fixed)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value="OKX"
              disabled
              className="block w-full rounded-md border-gray-300 bg-gray-50 pl-10 text-gray-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Asset */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spot Asset
            <span className="ml-1 text-xs text-blue-500">(Select trading pair)</span>
          </label>
          <div className="relative">
            <select
              name="asset"
              value={formData.asset}
              onChange={handleChange}
              disabled={disabled}
              className="block w-full rounded-md border-gray-300 pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
            >
              {assets.map(asset => (
                <option key={asset} value={asset}>{asset}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Order Type */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Type
            <span className="ml-1 text-xs text-gray-500">(Fixed)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value="Market"
              disabled
              className="block w-full rounded-md border-gray-300 bg-gray-50 pl-10 text-gray-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity (USD)
            <span className="ml-1 text-xs text-blue-500">(Enter trade size)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              disabled={disabled}
              min="1"
              step="1"
              className="block w-full rounded-md border-gray-300 pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Volatility */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Volatility
            <span className="ml-1 text-xs text-blue-500">(Adjust market volatility)</span>
          </label>
          <div className="relative mt-2">
            <input
              type="range"
              name="volatility"
              value={formData.volatility}
              onChange={handleChange}
              disabled={disabled}
              min="0"
              max="1"
              step="0.1"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">Low</span>
              <span className="text-sm font-medium text-blue-600">{formData.volatility}</span>
              <span className="text-xs text-gray-500">High</span>
            </div>
          </div>
        </div>

        {/* Fee Tier */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fee Tier
            <span className="ml-1 text-xs text-blue-500">(Select your tier)</span>
          </label>
          <div className="relative">
            <select
              name="feeTier"
              value={formData.feeTier}
              onChange={handleChange}
              disabled={disabled}
              className="block w-full rounded-md border-gray-300 pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="VIP1">VIP 1 (0.08%)</option>
              <option value="VIP2">VIP 2 (0.07%)</option>
              <option value="VIP3">VIP 3 (0.06%)</option>
              <option value="VIP4">VIP 4 (0.05%)</option>
              <option value="VIP5">VIP 5 (0.04%)</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out flex items-center justify-center space-x-2"
      >
        {disabled ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Simulating...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Run Simulation</span>
          </>
        )}
      </button>
    </form>
  );
};

export default InputPanel; 