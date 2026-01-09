import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, X, Search, BarChart3 } from 'lucide-react'
import StockCard from './components/StockCard'

interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  change_percent: number
  high: number
  low: number
  open: number
  previous_close: number
  volume: number
  market_cap: number | null
  timestamp: string
}

interface HistoricalData {
  dates: string[]
  prices: number[]
  volumes: number[]
}

interface StockData {
  quote: StockQuote
  historical: HistoricalData
}

const SUGGESTED_TICKERS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA']

function App() {
  const [searchValue, setSearchValue] = useState('')
  const [stocks, setStocks] = useState<Map<string, StockData>>(new Map())
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const websocket = new WebSocket(`ws://${window.location.hostname}:8000/ws`)

    websocket.onopen = () => {
      console.log('WebSocket connected')
      // Re-subscribe to existing stocks
      stocks.forEach((_, symbol) => {
        websocket.send(JSON.stringify({ action: 'subscribe', symbol }))
      })
    }

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'quote') {
        setStocks(prev => {
          const newStocks = new Map(prev)
          const existing = newStocks.get(message.data.symbol)
          if (existing) {
            newStocks.set(message.data.symbol, {
              ...existing,
              quote: message.data
            })
          }
          return newStocks
        })
      }
    }

    websocket.onclose = () => {
      console.log('WebSocket disconnected')
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [])

  const fetchStock = useCallback(async (symbol: string, period: string = '1mo') => {
    const upperSymbol = symbol.toUpperCase().trim()
    if (!upperSymbol) return

    setLoading(upperSymbol)
    setError(null)

    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/stock/${upperSymbol}?period=${period}`)
      if (!response.ok) {
        throw new Error('Stock not found')
      }
      const data: StockData = await response.json()

      setStocks(prev => {
        const newStocks = new Map(prev)
        newStocks.set(upperSymbol, data)
        return newStocks
      })

      // Subscribe to WebSocket updates
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'subscribe', symbol: upperSymbol }))
      }

      setSearchValue('')
    } catch (err) {
      setError(`Could not find stock "${upperSymbol}". Please check the ticker symbol.`)
    } finally {
      setLoading(null)
    }
  }, [ws])

  const removeStock = (symbol: string) => {
    setStocks(prev => {
      const newStocks = new Map(prev)
      newStocks.delete(symbol)
      return newStocks
    })

    // Unsubscribe from WebSocket updates
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'unsubscribe', symbol }))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStock(searchValue)
  }

  const refreshStock = (symbol: string, period: string) => {
    fetchStock(symbol, period)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Stock Ticker</h1>
        <p>Real-time stock prices powered by Yahoo Finance</p>
      </header>

      <form className="search-container" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Enter ticker symbol (e.g., AAPL)"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
        />
        <button
          type="submit"
          className="search-button"
          disabled={!searchValue.trim() || loading !== null}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <Search size={20} />
          )}
        </button>
      </form>

      {stocks.size === 0 && (
        <div className="suggested-tickers">
          {SUGGESTED_TICKERS.map(ticker => (
            <button
              key={ticker}
              className="suggested-ticker"
              onClick={() => fetchStock(ticker)}
              disabled={loading !== null}
            >
              {ticker}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && !stocks.has(loading) && (
        <div className="loading">
          <span className="spinner" />
          <span>Loading {loading}...</span>
        </div>
      )}

      {stocks.size > 0 ? (
        <div className="watchlist">
          {Array.from(stocks.entries()).map(([symbol, data]) => (
            <StockCard
              key={symbol}
              data={data}
              onRemove={() => removeStock(symbol)}
              onRefresh={(period) => refreshStock(symbol, period)}
              isLoading={loading === symbol}
            />
          ))}
        </div>
      ) : !loading && (
        <div className="empty-state">
          <BarChart3 className="empty-state-icon" />
          <h3>No stocks added yet</h3>
          <p>Enter a ticker symbol above or click a suggested ticker to get started</p>
        </div>
      )}
    </div>
  )
}

export default App
