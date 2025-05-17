# 📊 Trade Simulator – Task List

> **Goal**: Build a high-performance trade simulator using real-time OKX market data, integrating predictive models and visual output.

---

## ✅ Project Setup

- [ ] Initialize React frontend with Tailwind CSS
- [ ] Set up Python Flask backend
- [ ] Configure MongoDB or PostgreSQL
- [ ] Create `.env` for API keys, DB strings, etc.
- [ ] Set up virtual environments for frontend (`npm`) and backend (`venv` or `pipenv`)

---

## 🌐 WebSocket Integration (Backend)

- [ ] Connect to OKX WebSocket:
  - `wss://ws.gomarket-cpp.goquant.io/ws/l2-orderbook/okx/BTC-USDT-SWAP`
- [ ] Parse and store `asks`, `bids`, and `timestamp`
- [ ] Calculate and log internal latency (tick processing time)
- [ ] Store snapshot in database (MongoDB/PostgreSQL)
- [ ] Handle reconnection and error logging

---

## 🧠 Modeling Engine (Backend)

- [ ] **Slippage Estimation**
  - Linear or Quantile Regression using depth and volatility
- [ ] **Fee Calculation**
  - Rule-based on OKX Fee Tier structure
- [ ] **Market Impact**
  - Implement Almgren-Chriss model
- [ ] **Maker/Taker Probability**
  - Logistic regression based on orderbook and volatility
- [ ] **Net Cost**
  - Aggregate: Slippage + Fee + Market Impact

---

## 🔌 API Development (Flask)

- [ ] `POST /simulate`
  - Inputs: asset, quantity, volatility, fee tier
  - Outputs: slippage, fee, impact, net cost, maker/taker probability
- [ ] `GET /latest`
  - Returns most recent model outputs
- [ ] `GET /assets`
  - (Optional) List available symbols

---

## 🖥️ Frontend (React + TailwindCSS)

### UI Layout

- [ ] Left Panel – Input Parameters:
  - [ ] Exchange (OKX – static)
  - [ ] Spot Asset (dropdown)
  - [ ] Order Type: market (static)
  - [ ] Quantity (~100 USD)
  - [ ] Volatility (input or slider)
  - [ ] Fee Tier (dropdown)

- [ ] Right Panel – Output Parameters:
  - [ ] Expected Slippage
  - [ ] Expected Fee
  - [ ] Market Impact
  - [ ] Net Cost
  - [ ] Maker/Taker proportion
  - [ ] Internal Latency

---

## ⚙️ Optimization & Performance (Bonus)

- [ ] Measure latencies:
  - Data ingest → processing
  - Backend → frontend API latency
  - End-to-end response time
- [ ] Optimize:
  - WebSocket connection (async, threading)
  - Model computation (NumPy, vectorization)
  - UI rendering (React memoization, state batching)
  - Data structures (priority queues, efficient sorting)

---

## 📄 Documentation

- [ ] API Documentation
- [ ] Financial model explanations
- [ ] Regression method choices
- [ ] Almgren-Chriss implementation
- [ ] Performance tuning strategies
- [ ] Full README for setup + usage

---

## 🎥 Deliverables

- [ ] Fully working source code (frontend + backend)
- [ ] Code walkthrough + UI video recording
- [ ] Model + system explanation in video
- [ ] (Optional) Performance report and metrics dashboard

---

## 🗂 Folder Structure (Recommended)

```
/trade-simulator
├── backend/
│   ├── app.py
│   ├── models/
│   ├── websocket/
│   ├── routes/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   └── tailwind.config.js
├── db/
│   └── init.js / schema.sql
├── task.md
└── README.md
```

---
