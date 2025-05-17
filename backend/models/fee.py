from typing import Dict, Tuple

class FeeCalculator:
    def __init__(self):
        # OKX fee tiers (maker/taker fees)
        self.fee_tiers: Dict[str, Tuple[float, float]] = {
            'VIP1': (0.0008, 0.001),    # 0.08% / 0.10%
            'VIP2': (0.0007, 0.0009),   # 0.07% / 0.09%
            'VIP3': (0.0006, 0.0008),   # 0.06% / 0.08%
            'VIP4': (0.0005, 0.0007),   # 0.05% / 0.07%
            'VIP5': (0.0004, 0.0006),   # 0.04% / 0.06%
        }
        
    def calculate_fee(self, 
                     tier: str, 
                     quantity: float, 
                     maker_probability: float) -> Tuple[float, float]:
        """
        Calculate expected fee based on tier and maker/taker probability.
        
        Args:
            tier: Trading fee tier (VIP1-5)
            quantity: Trade size in base currency
            maker_probability: Probability of being a maker (0-1)
            
        Returns:
            Tuple of (fee_estimate, confidence)
        """
        if tier not in self.fee_tiers:
            # Default to highest fee tier if unknown
            tier = 'VIP1'
            
        maker_fee, taker_fee = self.fee_tiers[tier]
        taker_probability = 1 - maker_probability
        
        # Calculate weighted average fee
        expected_fee = (maker_fee * maker_probability + 
                       taker_fee * taker_probability)
        
        # Higher confidence for extreme probabilities
        confidence = 0.9 - abs(0.5 - maker_probability) * 0.2
        
        return expected_fee, confidence 