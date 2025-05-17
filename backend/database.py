from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.client = None
        self.db = None

    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017'))
            self.db = self.client.trade_simulator
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB connection")

    async def store_market_data(self, data):
        """Store market data snapshot."""
        try:
            formatted_data = {
                'timestamp': datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
                'exchange': 'OKX',
                'symbol': 'BTC-USDT-SWAP',
                'data': data
            }
            await self.db.market_data.insert_one(formatted_data)
        except Exception as e:
            logger.error(f"Failed to store market data: {e}")

    async def store_trade(self, trade_data):
        """Store trade data."""
        try:
            formatted_trade = {
                'timestamp': datetime.fromtimestamp(int(trade_data['ts']) / 1000).strftime("%Y-%m-%dT%H:%M:%SZ"),
                'exchange': 'OKX',
                'symbol': 'BTC-USDT-SWAP',
                'price': str(float(trade_data['px'])),  # Convert to string format
                'size': str(float(trade_data['sz'])),   # Convert to string format
                'side': trade_data['side']
            }
            await self.db.trades.insert_one(formatted_trade)
        except Exception as e:
            logger.error(f"Failed to store trade: {e}")

    async def get_recent_trades(self, limit=100):
        """Get recent trades."""
        try:
            cursor = self.db.trades.find().sort('timestamp', -1).limit(limit)
            return await cursor.to_list(length=limit)
        except Exception as e:
            logger.error(f"Failed to get recent trades: {e}")
            return []

    async def store_orderbook(self, orderbook_data):
        """Store orderbook snapshot."""
        try:
            formatted_orderbook = {
                'timestamp': datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
                'exchange': 'OKX',
                'symbol': 'BTC-USDT-SWAP',
                'asks': [[str(price), str(size)] for price, size in orderbook_data.get('asks', [])],
                'bids': [[str(price), str(size)] for price, size in orderbook_data.get('bids', [])]
            }
            await self.db.orderbook.insert_one(formatted_orderbook)
        except Exception as e:
            logger.error(f"Failed to store orderbook: {e}")

db = Database() 