# Trade Simulator

A high-performance trade simulator using real-time OKX market data, integrating predictive models and visual output.

## Features

- Real-time market data processing via WebSocket
- Trade simulation with multiple parameters
- Modern React frontend with TypeScript
- Flask backend with WebSocket integration
- Predictive modeling for trade costs

## Setup

### Backend Setup

1. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Unix/MacOS:
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory with:
```
MONGO_URI=mongodb://localhost:27017/trade_simulator
OKX_WS_URL=wss://ws.gomarket-cpp.goquant.io/ws/l2-orderbook/okx/BTC-USDT-SWAP
FLASK_APP=backend/app.py
FLASK_ENV=development
FLASK_DEBUG=1
```

4. Run the Flask server:
```bash
python app.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Architecture

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Flask + WebSocket
- Database: MongoDB
- Real-time Data: OKX WebSocket API

## API Endpoints

- `POST /api/simulate`: Run trade simulation
- `GET /api/latest`: Get latest model outputs
- `GET /api/assets`: List available trading pairs

## Development

- Frontend code is in `frontend/src`
- Backend code is in `backend/`
- WebSocket client is in `backend/websocket`
- Models are in `backend/models` 