export interface SimulationResult {
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

export interface SimulationParams {
  asset: string;
  quantity: number;
  volatility: number;
  feeTier: string;
}

export interface MarketData {
  timestamp: number;
  latest_metrics: {
    price: number;
    spread: number;
    depth: number;
  };
} 