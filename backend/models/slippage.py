import numpy as np
from typing import List, Tuple

class SlippageModel:
    def __init__(self):
        # Initialize model parameters
        self.depth_weight = 0.7
        self.volatility_weight = 0.3
        
    def calculate_slippage(self, 
                          orderbook_depth: List[List[float]], 
                          volatility: float,
                          quantity: float) -> Tuple[float, float]:
        """
        Calculate expected slippage using orderbook depth and volatility.
        
        Args:
            orderbook_depth: List of [price, quantity] pairs
            volatility: Market volatility (0-1)
            quantity: Trade size in base currency
            
        Returns:
            Tuple of (slippage_estimate, confidence)
        """
        # Convert to numpy array for efficient computation
        depth_array = np.array(orderbook_depth)
        
        # Calculate available liquidity at each level
        cumulative_quantity = np.cumsum(depth_array[:, 1])
        
        # Find the levels needed to fill the order
        required_levels = np.searchsorted(cumulative_quantity, quantity)
        
        if required_levels >= len(depth_array):
            # Not enough liquidity in orderbook
            return 1.0, 0.5
            
        # Calculate weighted average price impact
        weighted_prices = depth_array[:required_levels, 0] * depth_array[:required_levels, 1]
        avg_price = np.sum(weighted_prices) / np.sum(depth_array[:required_levels, 1])
        
        # Calculate base slippage from orderbook depth
        depth_slippage = (avg_price - depth_array[0, 0]) / depth_array[0, 0]
        
        # Adjust for volatility
        volatility_impact = volatility * self.volatility_weight
        depth_impact = depth_slippage * self.depth_weight
        
        total_slippage = depth_impact + volatility_impact
        confidence = 0.8 - (required_levels / len(depth_array)) * 0.3
        
        return float(total_slippage), float(confidence) 