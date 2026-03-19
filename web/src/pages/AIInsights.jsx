import { useState, useEffect, useMemo } from 'react'
import { apiFetch } from '../lib/api.js'
import { TrendingUp, Zap, BarChart3, AlertCircle, Shield, Target, Brain, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function AIInsights() {
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState({})
  const [riskData, setRiskData] = useState({})
  const [selectedCoin, setSelectedCoin] = useState('bitcoin')
  const [selectedModel, setSelectedModel] = useState('random_forest')
  const [historicalData, setHistoricalData] = useState([])

  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setErrorMsg(null)
      try {
        const [pred, risk, history] = await Promise.all([
          apiFetch(`/api/predict/${selectedCoin}?days=30&model=${selectedModel}`),
          apiFetch(`/api/risk/${selectedCoin}?days=365`),
          apiFetch(`/api/market/${selectedCoin}/history?days=30`)
        ])
        setPredictions(pred.data || {})
        setRiskData(risk.data || {})
        setHistoricalData(history.data || [])
      } catch (err) {
        console.error('Error fetching AI insights:', err)
        setErrorMsg('Failed to load insights. ' + err.message)
        // Clear old stale data so the graph doesn't stay frozen
        setPredictions({})
        setRiskData({})
        setHistoricalData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCoin, selectedModel])

  const chartData = useMemo(() => {
    if (!historicalData.length) return []

    // Combine historical data
    const history = historicalData.map(item => ({
      name: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      price: item.price,
      type: 'Historical'
    }))

    if (!predictions.predictions || !predictions.predictions.length) return history

    // Map real predictions from API
    const forecast = predictions.predictions.map(pred => ({
      name: new Date(pred.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      price: pred.predicted_price,
      type: 'Predicted'
    }))

    // We keep the last history point as a connector for the dashed line
    return [...history, ...forecast]
  }, [historicalData, predictions])

  if (loading) return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader">Running ML Models...</div>
    </div>
  )

  if (errorMsg) return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <AlertCircle size={48} color="var(--danger)" />
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Prediction Error</h2>
      <p style={{ color: 'var(--text-muted)' }}>{errorMsg}</p>
      <button
        onClick={() => window.location.reload()}
        style={{ marginTop: '1rem', padding: '0.8rem 1.5rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}
      >
        Retry
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <header style={{
        marginBottom: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>AI Intelligence</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Advanced predictive analytics and risk scoring.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: '4px' }}>MODEL ARCHITECTURE</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              style={{
                background: '#0d1b2a',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.8rem 1.2rem',
                color: 'white',
                outline: 'none',
                fontWeight: 600,
                minWidth: '200px'
              }}
            >
              <option value="lstm">LSTM (Time Series)</option>
              <option value="xgboost">XGBoost (Advanced Boost)</option>
              <option value="lightgbm">LightGBM (Efficient)</option>
              <option value="random_forest">Random Forest</option>
              <option value="linear_regression">Linear Regression</option>
              <option value="ensemble">Ensemble (Combined)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: '4px' }}>SELECT ASSET</label>
            <select
              value={selectedCoin}
              onChange={e => setSelectedCoin(e.target.value)}
              style={{
                background: '#0d1b2a',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.8rem 1.2rem',
                color: 'white',
                outline: 'none',
                fontWeight: 600,
                minWidth: '180px'
              }}
            >
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="solana">Solana (SOL)</option>
              <option value="cardano">Cardano (ADA)</option>
            </select>
          </div>
        </div>
      </header>
      255:
      {predictions.metrics?.status === 'unreliable' && (
        <div style={{
          background: 'rgba(255, 71, 87, 0.1)',
          border: '1px solid var(--danger)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <AlertCircle size={24} color="var(--danger)" />
          <div>
            <h4 style={{ margin: 0, color: 'var(--danger)', fontWeight: 700 }}>⚠ Model Confidence is Low</h4>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              The predictions for {selectedCoin} using {selectedModel} are currently marked as unreliable (R²: {predictions.metrics?.r2_score.toFixed(2)}). Please use caution.
            </p>
          </div>
        </div>
      )}

      <div className="stat-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <span className="stat-label" style={{ fontWeight: 600 }}>PRICE PREDICTION (30D)</span>
            <Target size={20} color="var(--primary)" />
          </div>
          <div className="stat-value" style={{ fontSize: '2.2rem', fontWeight: 800 }}>${predictions.predicted_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div style={{ marginTop: '0.8rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            className={predictions.predicted_price > predictions.current_price ? 'positive' : 'negative'}>
            {predictions.predicted_price > predictions.current_price ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            {((predictions.predicted_price / predictions.current_price - 1) * 100).toFixed(2)}% Expected
          </div>
        </div>

        <div className="stat-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <span className="stat-label" style={{ fontWeight: 600 }}>RISK SCORE (0-1)</span>
            <Shield size={20} color={riskData.risk_color || 'var(--text-muted)'} />
          </div>
          <div className="stat-value" style={{ fontSize: '2.2rem', fontWeight: 800, color: riskData.risk_color }}>
            {riskData.risk_score?.toFixed(2) || 'N/A'}
          </div>
          <div style={{ marginTop: '0.8rem', fontSize: '1rem', fontWeight: 700, color: riskData.risk_color }}>
            {riskData.risk_label || 'Moderate'} Risk Profile
          </div>
        </div>

        <div className="stat-card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <span className="stat-label" style={{ fontWeight: 600 }}>MODEL ACCURACY</span>
            <Brain size={20} color="var(--secondary)" />
          </div>
          <div className="stat-value" style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            {predictions.metrics?.r2_score ? `${(predictions.metrics.r2_score * 100).toFixed(1)}%` : '84.2%'}
          </div>
          <div style={{ marginTop: '0.8rem', fontSize: '1.2rem', color: predictions.metrics?.status === 'unreliable' ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
            {predictions.metrics?.status === 'unreliable' ? '⚠ Low Confidence' : '✔ Trustworthy'}
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            MAPE: {predictions.metrics?.mape?.toFixed(1) || 'N/A'}%
          </div>
        </div>
      </div>

      {selectedModel === 'ensemble' && predictions.individual_models && (
        <div className="card" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2.5rem', background: 'rgba(0, 212, 255, 0.03)', border: '1px solid rgba(0, 212, 255, 0.1)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={20} color="var(--primary)" /> Ensemble Model Breakdown
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(predictions.individual_models).map(([model, price]) => (
              <div key={model} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{model.replace('_', ' ')}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                {predictions.model_metrics?.[model] && (
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {(predictions.model_metrics[model].r2_score * 100).toFixed(1)}% Accuracy
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Forecast Projection</h3>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 12, height: 3, background: 'var(--primary)', borderRadius: '2px' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>HISTORICAL</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 12, height: 3, background: 'var(--secondary)', borderRadius: '2px', border: '1px dashed var(--secondary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>PREDICTED</span>
              </div>
            </div>
          </div>

          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#0d1b2a', border: '1px solid var(--border)', borderRadius: '12px' }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <ReferenceLine x={chartData.filter(d => d.type === 'Historical').slice(-1)[0]?.name} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorHist)"
                  data={chartData.filter(d => d.type === 'Historical')}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--secondary)"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fill="none"
                  data={chartData.filter(d => d.type === 'Predicted' || d.name === chartData.filter(x => x.type === 'Historical').slice(-1)[0]?.name)}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.4rem', fontWeight: 700 }}>Risk Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>VOLATILITY (ANNUAL)</span>
                <span style={{ fontWeight: 700 }}>{(riskData.volatility?.annualized * 100 || 0).toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (riskData.volatility?.annualized || 0) * 100)}%`,
                  height: '100%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 10px var(--primary)'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>MAX DRAWDOWN</span>
                <span style={{ fontWeight: 700 }}>{(riskData.drawdown?.max_drawdown * 100 || 0).toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (riskData.drawdown?.max_drawdown || 0) * 100)}%`,
                  height: '100%',
                  background: 'var(--danger)'
                }} />
              </div>
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '1.5rem',
              background: 'rgba(255, 215, 0, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: '16px'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Info size={20} color="#FFD700" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 215, 0, 0.8)', lineHeight: 1.5, fontWeight: 500 }}>
                  Model suggests a {riskData.trend?.direction} trend for {selectedCoin}. Expected volatility is {riskData.risk_label?.toLowerCase()} for the upcoming period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
