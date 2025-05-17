import asyncio
import json
import aiohttp
import logging
import random
import os
import time
from datetime import datetime
from urllib.parse import urlparse
from database import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketDataWebSocket:
    def __init__(self):
        self.clients = set()
        self.okx_ws_url = os.getenv('OKX_WS_URL', 'wss://ws.okx.com:8443/ws/v5/public')
        self.ws = None
        self.running = False
        self.reconnect_delay = 5
        self.max_reconnect_delay = 60
        self._connection_task = None
        self._simulation_task = None
        self.use_simulation = False
        self.last_price = 45000.0
        self.volatility = 0.002
        self.last_process_time = None
        
        # Enhanced proxy configuration
        self.proxy = None
        # Try SOCKS5 proxy first (for Proton VPN)
        socks_proxy = os.getenv('SOCKS_PROXY')
        if socks_proxy:
            self.proxy = socks_proxy
            logger.info(f"Using SOCKS proxy: {self.proxy}")
        else:
            # Fallback to HTTP/HTTPS proxy
            http_proxy = os.getenv('HTTP_PROXY') or os.getenv('HTTPS_PROXY')
            if http_proxy:
                try:
                    proxy_parts = urlparse(http_proxy)
                    if proxy_parts.hostname and proxy_parts.port:
                        self.proxy = http_proxy
                        logger.info(f"Using HTTP proxy: {self.proxy}")
                except Exception as e:
                    logger.error(f"Invalid proxy URL: {e}")

    async def register(self, websocket):
        self.clients.add(websocket)
        logger.info(f"New client connected. Total clients: {len(self.clients)}")
        if self.use_simulation:
            await self.send_simulated_data_to_client(websocket)

    async def unregister(self, websocket):
        self.clients.remove(websocket)
        logger.info(f"Client disconnected. Total clients: {len(self.clients)}")

    async def send_to_clients(self, message):
        if not self.clients:
            return
        dead_clients = set()
        for client in self.clients:
            try:
                await client.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending to client: {e}")
                dead_clients.add(client)
        for dead_client in dead_clients:
            await self.unregister(dead_client)

    async def send_simulated_data_to_client(self, websocket):
        try:
            ticker_data = self.generate_simulated_ticker()
            await websocket.send_text(json.dumps(ticker_data))
        except Exception as e:
            logger.error(f"Error sending initial simulated data: {e}")

    def generate_simulated_ticker(self):
        price_change = self.last_price * self.volatility * (random.random() * 2 - 1)
        self.last_price += price_change
        high_24h = self.last_price * (1 + random.random() * 0.05)
        low_24h = self.last_price * (1 - random.random() * 0.05)
        volume_24h = random.uniform(1000, 5000)
        return {
            'type': 'ticker',
            'timestamp': datetime.now().isoformat(),
            'price': round(self.last_price, 2),
            'high24h': round(high_24h, 2),
            'low24h': round(low_24h, 2),
            'volume24h': round(volume_24h, 2),
            'change24h': round((price_change / self.last_price) * 100, 2)
        }

    async def simulate_market_data(self):
        while self.running and self.use_simulation:
            try:
                ticker_data = self.generate_simulated_ticker()
                await self.send_to_clients(ticker_data)
                if random.random() < 0.3:
                    trade_data = {
                        'type': 'trade',
                        'timestamp': datetime.now().isoformat(),
                        'price': round(self.last_price + random.uniform(-10, 10), 2),
                        'size': round(random.uniform(0.1, 2.0), 4),
                        'side': random.choice(['buy', 'sell'])
                    }
                    await self.send_to_clients(trade_data)
                await asyncio.sleep(1)
            except Exception as e:
                logger.error(f"Error in simulation: {e}")
                await asyncio.sleep(1)

    async def reconnect(self):
        """Handle reconnection with exponential backoff."""
        if self.ws:
            try:
                await self.ws.close()
            except:
                pass
        self.ws = None
        
        await asyncio.sleep(self.reconnect_delay)
        self.reconnect_delay = min(self.reconnect_delay * 2, self.max_reconnect_delay)
        
        if self.reconnect_delay >= 20 and not self.use_simulation:
            logger.info("Switching to simulated market data after multiple failed connection attempts")
            self.use_simulation = True
            self._simulation_task = asyncio.create_task(self.simulate_market_data())

    async def connect_to_exchange(self):
        self.reconnect_delay = 5
        while self.running and not self.use_simulation:
            try:
                timeout = aiohttp.ClientTimeout(total=30)
                # Configure for VPN usage
                connector = aiohttp.TCPConnector(
                    ssl=False,  # Disable SSL verification for VPN
                    force_close=True,  # Force close connections
                    enable_cleanup_closed=True  # Cleanup closed connections
                )
                
                async with aiohttp.ClientSession(
                    timeout=timeout,
                    connector=connector,
                    trust_env=True  # Trust environment for proxy settings
                ) as session:
                    ws_kwargs = {
                        'heartbeat': 30,
                        'headers': {
                            'User-Agent': 'Mozilla/5.0',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    }
                    
                    try:
                        async with session.ws_connect(self.okx_ws_url, **ws_kwargs) as ws:
                            self.ws = ws
                            logger.info("Connected to OKX WebSocket")
                            
                            if not await self.subscribe_market_data():
                                continue
                            
                            self.reconnect_delay = 5
                            
                            async for msg in ws:
                                if msg.type == aiohttp.WSMsgType.TEXT:
                                    try:
                                        data = json.loads(msg.data)
                                        processed_data = await self.process_market_data(data)
                                        if processed_data:
                                            await self.send_to_clients(processed_data)
                                    except json.JSONDecodeError as e:
                                        logger.error(f"Failed to decode message: {e}")
                                    except Exception as e:
                                        logger.error(f"Error processing message: {e}")
                                
                                elif msg.type in (aiohttp.WSMsgType.CLOSED, aiohttp.WSMsgType.ERROR):
                                    logger.error(f"WebSocket connection closed: {msg.type}")
                                    break
                    except aiohttp.ClientError as e:
                        logger.error(f"WebSocket connection error: {e}")
                        await self.reconnect()

            except Exception as e:
                logger.error(f"Unexpected error in WebSocket connection: {e}")
                self.ws = None
                await self.reconnect()
            finally:
                if connector and not connector.closed:
                    await connector.close()

    async def subscribe_market_data(self):
        """Subscribe to OKX market data."""
        subscribe_message = {
            "op": "subscribe",
            "args": [
                {
                    "channel": "tickers",
                    "instId": "BTC-USDT-SWAP"
                },
                {
                    "channel": "trades",
                    "instId": "BTC-USDT-SWAP"
                }
            ]
        }
        if self.ws:
            try:
                await self.ws.send_str(json.dumps(subscribe_message))
                logger.info("Subscribed to market data and trades")
                return True
            except Exception as e:
                logger.error(f"Failed to subscribe to market data: {e}")
                await self.reconnect()
                return False
        return False

    async def process_market_data(self, data):
        """Process OKX WebSocket data format."""
        try:
            start_time = time.time()
            
            if 'event' in data:
                logger.info(f"Received event: {data['event']}")
                return None
                
            if 'arg' not in data or 'data' not in data:
                return None

            channel = data['arg'].get('channel')
            
            # Store raw data in database
            await db.store_market_data(data)
            
            # Handle trades data
            if channel == 'trades':
                trade_data = data['data'][0]
                await db.store_trade(trade_data)
                return {
                    'type': 'trade',
                    'timestamp': datetime.fromtimestamp(int(trade_data['ts']) / 1000).isoformat(),
                    'price': str(float(trade_data['px'])),
                    'size': str(float(trade_data['sz'])),
                    'side': trade_data['side'].lower()
                }
            
            # Handle ticker data
            elif channel == 'tickers':
                ticker_data = data['data'][0]
                
                # Calculate 24h price change percentage
                open_24h = float(ticker_data.get('open24h', 0))
                last_price = float(ticker_data.get('last', 0))
                change_24h = ((last_price - open_24h) / open_24h * 100) if open_24h > 0 else 0

                # Calculate processing latency
                process_time = (time.time() - start_time) * 1000
                logger.info(f"Processing latency: {process_time:.2f}ms")

                # Format orderbook data
                orderbook = {
                    'asks': [[str(ticker_data.get('askPx', '0')), str(ticker_data.get('askSz', '0'))]],
                    'bids': [[str(ticker_data.get('bidPx', '0')), str(ticker_data.get('bidSz', '0'))]]
                }
                await db.store_orderbook(orderbook)

                return {
                    'type': 'ticker',
                    'timestamp': datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
                    'exchange': 'OKX',
                    'symbol': 'BTC-USDT-SWAP',
                    'price': str(last_price),
                    'high24h': str(float(ticker_data.get('high24h', 0))),
                    'low24h': str(float(ticker_data.get('low24h', 0))),
                    'volume24h': str(float(ticker_data.get('volCcy24h', 0))),
                    'change24h': str(round(change_24h, 2)),
                    'asks': orderbook['asks'],
                    'bids': orderbook['bids'],
                    'latency': str(round(process_time, 2))
                }

        except Exception as e:
            logger.error(f"Error processing OKX data: {str(e)}")
            logger.error(f"Raw data: {json.dumps(data)}")
            return None

    async def start(self):
        """Start the WebSocket connection and database."""
        if self._connection_task is not None:
            return
        
        # Connect to database
        await db.connect()
        
        self.running = True
        self._connection_task = asyncio.create_task(self.connect_to_exchange())

    async def stop(self):
        """Stop the WebSocket connection and close database."""
        self.running = False
        if self._connection_task:
            self._connection_task.cancel()
            try:
                await self._connection_task
            except asyncio.CancelledError:
                pass
            self._connection_task = None
        
        if self._simulation_task:
            self._simulation_task.cancel()
            try:
                await self._simulation_task
            except asyncio.CancelledError:
                pass
            self._simulation_task = None
        
        if self.ws:
            await self.ws.close()
        self.ws = None
        
        # Close database connection
        await db.close()
