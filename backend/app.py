from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List
import uvicorn
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os
import time
import numpy as np
from websocket.market_data import MarketDataWebSocket

# Load .env
load_dotenv()

# Initialize WebSocket handler
market_ws = MarketDataWebSocket()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await market_ws.start()
    except Exception as e:
        print(f"Failed to start market data connection: {e}")
    yield
    await market_ws.stop()

app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "market_ws_connected": market_ws.ws is not None
    }

@app.websocket("/ws/market-data")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await market_ws.register(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await market_ws.unregister(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await market_ws.unregister(websocket)

# Models
class SimulationParams(BaseModel):
    asset: str
    quantity: float
    volatility: float
    feeTier: str

@app.post("/api/simulate")
async def simulate_trade(params: SimulationParams):
    start_time = time.time()
    if params.quantity <= 0:
        return {"error": "Quantity must be positive"}
    if not (0 <= params.volatility <= 1):
        return {"error": "Volatility must be between 0 and 1"}

    fee_rates = {
        'VIP1': 0.002,
        'VIP2': 0.0018,
        'VIP3': 0.0015,
        'VIP4': 0.0012,
        'VIP5': 0.001
    }
    fee_rate = fee_rates.get(params.feeTier, 0.002)

    slippage = 0.0005 + (params.volatility * 0.001)
    impact = 0.0005 + (params.quantity / 10000) * params.volatility
    net_cost = params.quantity * (1 + slippage + fee_rate + impact)
    taker_prob = 0.3 + (params.volatility * 0.4)
    maker_prob = 1 - taker_prob
    latency = (time.time() - start_time) * 1000

    return {
        'slippage': slippage,
        'fee': fee_rate,
        'impact': impact,
        'netCost': round(net_cost, 2),
        'makerTakerProbability': {
            'maker': round(maker_prob, 3),
            'taker': round(taker_prob, 3)
        },
        'latency': round(latency, 2)
    }

@app.get("/api/historical")
async def get_historical_data(days: int = 90):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    dates = [start_date + timedelta(days=x) for x in range(days + 1)]
    trend_cycle = np.sin(np.linspace(0, 4*np.pi, len(dates)))
    base_volume = 1000000
    data = []

    for i, date in enumerate(dates):
        daily_volatility = 0.3 + 0.2 * trend_cycle[i] + np.random.random() * 0.2
        volume = base_volume * (1 + trend_cycle[i] * 0.3 + np.random.normal(0, 0.1))
        slippage = 0.0005 + (daily_volatility * 0.001)
        impact = 0.0005 + (volume / base_volume) * daily_volatility * 0.001
        data.append({
            'timestamp': date.isoformat(),
            'slippage': round(slippage, 6),
            'impact': round(impact, 6),
            'volume': round(volume, 2)
        })
    return data

@app.get("/api/price-history")
async def get_price_history(days: int = 90):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    dates = [start_date + timedelta(days=x) for x in range(days + 1)]
    base_price = 50000
    base_volume = 1000000
    trend = np.cumsum(np.random.normal(0, 1, len(dates))) * 100
    volatility = np.abs(np.sin(np.linspace(0, 8*np.pi, len(dates)))) * 200 + 100
    data = []

    for i, date in enumerate(dates):
        price_base = base_price + trend[i]
        daily_range = volatility[i] * np.random.random()
        open_price = price_base + np.random.normal(0, volatility[i])
        close_price = open_price + np.random.normal(0, volatility[i])
        high_price = max(open_price, close_price) + daily_range
        low_price = min(open_price, close_price) - daily_range
        price_change = abs(close_price - open_price)
        volume = base_volume * (1 + price_change / price_base) * (1 + np.random.normal(0, 0.2))

        data.append({
            'timestamp': date.isoformat(),
            'open': round(open_price, 2),
            'high': round(high_price, 2),
            'low': round(low_price, 2),
            'close': round(close_price, 2),
            'volume': round(volume, 2)
        })
    return data

@app.get("/api/assets")
async def get_assets():
    return {
        'assets': ['BTC-USDT']
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
