import { SimulationParams, SimulationResult, MarketData } from '../types';
import { HistoricalDataPoint } from '../components/HistoricalChart';
import { PriceDataPoint } from '../components/PriceChart';

const API_BASE_URL = 'http://localhost:5000/api';

export const simulateTrade = async (params: SimulationParams): Promise<SimulationResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Simulation request failed:', error);
    throw error;
  }
};

export const getLatestMarketData = async (): Promise<MarketData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/latest`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Latest market data request failed:', error);
    throw error;
  }
};

export const getAvailableAssets = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.assets;
  } catch (error) {
    console.error('Assets request failed:', error);
    throw error;
  }
};

export const getHistoricalData = async (days: number = 90): Promise<HistoricalDataPoint[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/historical?days=${days}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Historical data request failed:', error);
    throw error;
  }
};

export const getPriceHistory = async (days: number = 90): Promise<PriceDataPoint[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/price-history?days=${days}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Price history request failed:', error);
    throw error;
  }
}; 