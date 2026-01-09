"""
Stock Ticker API - FastAPI Backend
Fetches real-time stock data from Yahoo Finance
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import yfinance as yf
import asyncio
import json
from datetime import datetime, timedelta

app = FastAPI(title="Stock Ticker API", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StockQuote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    high: float
    low: float
    open: float
    previous_close: float
    volume: int
    market_cap: Optional[float] = None
    timestamp: str


class HistoricalData(BaseModel):
    dates: list[str]
    prices: list[float]
    volumes: list[int]


class StockInfo(BaseModel):
    quote: StockQuote
    historical: HistoricalData


def get_stock_data(symbol: str) -> dict:
    """Fetch stock data from Yahoo Finance"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info

        # Get current price data
        current_price = info.get('currentPrice') or info.get('regularMarketPrice', 0)
        previous_close = info.get('previousClose') or info.get('regularMarketPreviousClose', 0)

        change = current_price - previous_close if current_price and previous_close else 0
        change_percent = (change / previous_close * 100) if previous_close else 0

        quote = {
            "symbol": symbol.upper(),
            "name": info.get('longName') or info.get('shortName', symbol.upper()),
            "price": round(current_price, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "high": round(info.get('dayHigh') or info.get('regularMarketDayHigh', 0), 2),
            "low": round(info.get('dayLow') or info.get('regularMarketDayLow', 0), 2),
            "open": round(info.get('open') or info.get('regularMarketOpen', 0), 2),
            "previous_close": round(previous_close, 2),
            "volume": info.get('volume') or info.get('regularMarketVolume', 0),
            "market_cap": info.get('marketCap'),
            "timestamp": datetime.now().isoformat()
        }

        return quote
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not fetch data for symbol: {symbol}. Error: {str(e)}")


def get_historical_data(symbol: str, period: str = "1mo") -> dict:
    """Fetch historical price data"""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)

        if hist.empty:
            return {"dates": [], "prices": [], "volumes": []}

        return {
            "dates": [d.strftime("%Y-%m-%d") for d in hist.index],
            "prices": [round(p, 2) for p in hist['Close'].tolist()],
            "volumes": [int(v) for v in hist['Volume'].tolist()]
        }
    except Exception as e:
        return {"dates": [], "prices": [], "volumes": []}


@app.get("/")
async def root():
    """API root endpoint"""
    return {"message": "Stock Ticker API", "version": "1.0.0"}


@app.get("/api/quote/{symbol}", response_model=StockQuote)
async def get_quote(symbol: str):
    """Get current stock quote for a symbol"""
    return get_stock_data(symbol)


@app.get("/api/stock/{symbol}")
async def get_stock(symbol: str, period: str = "1mo"):
    """Get full stock info including historical data"""
    quote = get_stock_data(symbol)
    historical = get_historical_data(symbol, period)
    return {"quote": quote, "historical": historical}


@app.get("/api/search/{query}")
async def search_stocks(query: str):
    """Search for stock symbols"""
    try:
        ticker = yf.Ticker(query)
        info = ticker.info
        if info and info.get('symbol'):
            return [{
                "symbol": info.get('symbol'),
                "name": info.get('longName') or info.get('shortName', query.upper())
            }]
        return []
    except:
        return []


# WebSocket for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[WebSocket, set] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[websocket] = set()

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]

    def subscribe(self, websocket: WebSocket, symbol: str):
        if websocket in self.active_connections:
            self.active_connections[websocket].add(symbol.upper())

    def unsubscribe(self, websocket: WebSocket, symbol: str):
        if websocket in self.active_connections:
            self.active_connections[websocket].discard(symbol.upper())

    async def send_update(self, websocket: WebSocket, data: dict):
        await websocket.send_json(data)


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time price updates"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("action") == "subscribe":
                symbol = message.get("symbol", "").upper()
                if symbol:
                    manager.subscribe(websocket, symbol)
                    # Send initial data
                    try:
                        quote = get_stock_data(symbol)
                        await manager.send_update(websocket, {"type": "quote", "data": quote})
                    except:
                        await manager.send_update(websocket, {"type": "error", "message": f"Invalid symbol: {symbol}"})

            elif message.get("action") == "unsubscribe":
                symbol = message.get("symbol", "").upper()
                manager.unsubscribe(websocket, symbol)

    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def price_updater():
    """Background task to send price updates"""
    while True:
        await asyncio.sleep(10)  # Update every 10 seconds
        for websocket, symbols in list(manager.active_connections.items()):
            for symbol in symbols:
                try:
                    quote = get_stock_data(symbol)
                    await manager.send_update(websocket, {"type": "quote", "data": quote})
                except:
                    pass


@app.on_event("startup")
async def startup_event():
    """Start background price updater"""
    asyncio.create_task(price_updater())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
