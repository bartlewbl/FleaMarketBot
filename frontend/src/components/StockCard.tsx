import { useState } from 'react'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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

interface StockCardProps {
  data: StockData
  onRemove: () => void
  onRefresh: (period: string) => void
  isLoading: boolean
}

const PERIODS = [
  { value: '5d', label: '5D' },
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '6mo', label: '6M' },
  { value: '1y', label: '1Y' },
]

function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toLocaleString()
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export default function StockCard({ data, onRemove, onRefresh, isLoading }: StockCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('1mo')
  const { quote, historical } = data
  const isPositive = quote.change >= 0

  const chartData = historical.dates.map((date, i) => ({
    date: date.slice(5), // Show MM-DD
    price: historical.prices[i]
  }))

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    onRefresh(period)
  }

  const minPrice = Math.min(...historical.prices) * 0.995
  const maxPrice = Math.max(...historical.prices) * 1.005

  return (
    <div className="stock-card">
      <div className="live-indicator">
        <span className="live-dot" />
        LIVE
      </div>

      <div className="stock-card-header">
        <div>
          <div className="stock-symbol">{quote.symbol}</div>
          <div className="stock-name" title={quote.name}>{quote.name}</div>
        </div>
        <button className="remove-button" onClick={onRemove} title="Remove">
          <X size={20} />
        </button>
      </div>

      <div className="stock-price">{formatPrice(quote.price)}</div>

      <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.change_percent.toFixed(2)}%)
      </div>

      <div className="stock-details">
        <div className="detail-item">
          <span className="detail-label">Open</span>
          <span className="detail-value">{formatPrice(quote.open)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Prev Close</span>
          <span className="detail-value">{formatPrice(quote.previous_close)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Day High</span>
          <span className="detail-value">{formatPrice(quote.high)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Day Low</span>
          <span className="detail-value">{formatPrice(quote.low)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Volume</span>
          <span className="detail-value">{formatNumber(quote.volume)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Market Cap</span>
          <span className="detail-value">{quote.market_cap ? formatNumber(quote.market_cap) : 'N/A'}</span>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="chart-container">
          <div className="chart-header">
            <span className="chart-title">Price History</span>
            <div className="period-buttons">
              {PERIODS.map(period => (
                <button
                  key={period.value}
                  className={`period-button ${selectedPeriod === period.value ? 'active' : ''}`}
                  onClick={() => handlePeriodChange(period.value)}
                  disabled={isLoading}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                stroke="#666"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                stroke="#666"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => '$' + v.toFixed(0)}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: '#242424',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [formatPrice(value), 'Price']}
                labelStyle={{ color: '#888' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#00d26a' : '#ff4757'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
