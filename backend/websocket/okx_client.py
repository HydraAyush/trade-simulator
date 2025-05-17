import asyncio
import json
import websockets
import logging
from datetime import datetime
from typing import Dict, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OKXWebSocketClient:
    def __init__(self, uri: str):
        self.uri = uri
        self.orderbook: Dict[str, List[List[float]]] = {
            'asks': [],
            'bids': []
        }
        self.last_update: float = 0

    async def connect(self):
        """Establish WebSocket connection and handle incoming messages."""
        while True:
            try:
                async with websockets.connect(self.uri) as websocket:
                    logger.info(f"Connected to {self.uri}")
                    while True:
                        message = await websocket.recv()
                        await self.handle_message(message)
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await asyncio.sleep(5)  # Wait before reconnecting

    async def handle_message(self, message: str):
        """Process incoming WebSocket messages."""
        try:
            data = json.loads(message)
            
            # Calculate internal latency
            receive_time = datetime.now().timestamp()
            processing_latency = receive_time - self.last_update if self.last_update else 0
            
            # Update orderbook
            if 'asks' in data:
                self.orderbook['asks'] = data['asks']
            if 'bids' in data:
                self.orderbook['bids'] = data['bids']
            
            self.last_update = receive_time
            
            # Log metrics
            logger.info(f"Processing latency: {processing_latency*1000:.2f}ms")
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")

    def get_current_orderbook(self) -> Dict[str, List[List[float]]]:
        """Return the current state of the orderbook."""
        return self.orderbook

    def get_last_update_time(self) -> float:
        """Return the timestamp of the last update."""
        return self.last_update 