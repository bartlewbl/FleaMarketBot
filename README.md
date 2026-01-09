# Stock Ticker App

A real-time stock ticker application with a Python FastAPI backend and React frontend. Get live stock prices, historical data, and beautiful charts powered by Yahoo Finance.

## Features

- **Real-time Stock Quotes**: Live price updates via WebSocket
- **Historical Charts**: Interactive price charts with multiple time periods (5D, 1M, 3M, 6M, 1Y)
- **Stock Details**: View open, close, high, low, volume, and market cap
- **Watchlist**: Track multiple stocks simultaneously
- **Modern UI**: Dark theme with smooth animations and responsive design

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **yfinance** - Yahoo Finance API wrapper
- **WebSockets** - Real-time price updates
- **uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Recharts** - Charting library
- **Vite** - Build tool
- **Lucide React** - Icons

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quote/{symbol}` | GET | Get current stock quote |
| `/api/stock/{symbol}` | GET | Get quote + historical data |
| `/api/search/{query}` | GET | Search for stocks |
| `/ws` | WebSocket | Real-time price updates |

### Query Parameters

- `period` - Historical data period: `5d`, `1mo`, `3mo`, `6mo`, `1y` (default: `1mo`)

## WebSocket Usage

Connect to `/ws` and send JSON messages:

```javascript
// Subscribe to a stock
{ "action": "subscribe", "symbol": "AAPL" }

// Unsubscribe from a stock
{ "action": "unsubscribe", "symbol": "AAPL" }
```

## Screenshots

The app features a modern dark theme with:
- Gradient header and accent colors
- Animated live indicators
- Responsive card-based layout
- Interactive price charts with tooltips

## License

MIT
