import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import bgImage from '../bg.webp'

export default function Dashboard() {
  const [coins, setCoins] = useState([])
  const [form, setForm] = useState({ symbol: '', name: '', quantity: '', buyPrice: '', notes: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  // Price Alert states
  const [alerts, setAlerts] = useState([]) // { id, symbol, targetPrice, condition }
  const [alertForm, setAlertForm] = useState({ symbol: '', targetPrice: '', condition: 'above' })
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [liveAlerts, setLiveAlerts] = useState([]) // triggered alerts
  const [livePrices, setLivePrices] = useState({}) // { BTC: 67000, ETH: 3200 }

  const navigate = useNavigate()
  const alertCheckRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { fetchCoins() }, [])

  // Fetch live prices every 30s using CoinGecko free API
  useEffect(() => {
    fetchLivePrices()
    const interval = setInterval(fetchLivePrices, 30000)
    return () => clearInterval(interval)
  }, [])

  // Check alerts whenever prices update
  useEffect(() => {
    checkAlerts()
  }, [livePrices, alerts])

  const fetchCoins = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/coins', { headers })
      setCoins(res.data.portfolio)
    } catch (err) { console.error(err) }
  }

  const fetchLivePrices = async () => {
    try {
      const res = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,cardano,dogecoin,ripple,avalanche-2,matic-network&vs_currencies=usd'
      )
      const map = {
        bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', binancecoin: 'BNB',
        cardano: 'ADA', dogecoin: 'DOGE', ripple: 'XRP',
        'avalanche-2': 'AVAX', 'matic-network': 'MATIC'
      }
      const prices = {}
      Object.entries(res.data).forEach(([key, val]) => {
        if (map[key]) prices[map[key]] = val.usd
      })
      setLivePrices(prices)
    } catch (err) { console.error('Price fetch failed', err) }
  }

  const checkAlerts = () => {
    const triggered = []
    alerts.forEach(alert => {
      const price = livePrices[alert.symbol?.toUpperCase()]
      if (!price) return
      if (alert.condition === 'above' && price >= alert.targetPrice) triggered.push({ ...alert, currentPrice: price })
      if (alert.condition === 'below' && price <= alert.targetPrice) triggered.push({ ...alert, currentPrice: price })
    })
    setLiveAlerts(triggered)
  }

  const addAlert = (e) => {
    e.preventDefault()
    if (!alertForm.symbol || !alertForm.targetPrice) return
    const newAlert = { id: Date.now(), ...alertForm, targetPrice: parseFloat(alertForm.targetPrice) }
    setAlerts(prev => [...prev, newAlert])
    setAlertForm({ symbol: '', targetPrice: '', condition: 'above' })
    setShowAlertForm(false)
    setSuccess('Price alert set!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const removeAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/v1/coins/${editId}`, form, { headers })
        setSuccess('Coin updated successfully!')
        setEditId(null)
      } else {
        await axios.post('http://localhost:5000/api/v1/coins', form, { headers })
        setSuccess('Coin added to portfolio!')
      }
      setForm({ symbol: '', name: '', quantity: '', buyPrice: '', notes: '' })
      setShowForm(false)
      fetchCoins()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
      setTimeout(() => setError(''), 3000)
    }
    setLoading(false)
  }

  const handleEdit = (coin) => {
    setEditId(coin._id)
    setForm({ symbol: coin.symbol, name: coin.name, quantity: coin.quantity, buyPrice: coin.buyPrice, notes: coin.notes })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this coin from your portfolio?')) return
    await axios.delete(`http://localhost:5000/api/v1/coins/${id}`, { headers })
    setSuccess('Coin removed!')
    setTimeout(() => setSuccess(''), 3000)
    fetchCoins()
  }

  const logout = () => { localStorage.clear(); navigate('/login') }

  const totalInvested = coins.reduce((sum, c) => sum + c.totalInvested, 0)

  const coinColors = {
    BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', BNB: '#f3ba2f',
    ADA: '#0033ad', DOT: '#e6007a', DOGE: '#c3a634', XRP: '#346aa9',
    AVAX: '#e84142', MATIC: '#8247e5'
  }
  const getCoinColor = (symbol) => coinColors[symbol?.toUpperCase()] || '#6c63ff'

  const getPnL = (coin) => {
    const live = livePrices[coin.symbol?.toUpperCase()]
    if (!live) return null
    const pnl = (live - coin.buyPrice) * coin.quantity
    const pct = ((live - coin.buyPrice) / coin.buyPrice) * 100
    return { pnl, pct, live }
  }

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .coin-row:hover { background: rgba(255,255,255,0.05) !important; }
        .action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 20px 60px rgba(0,0,0,0.25) !important; }
        .add-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        input:focus, select:focus { outline: none; border-color: #6c63ff !important; box-shadow: 0 0 0 3px rgba(108,99,255,0.2) !important; }
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.4); border-radius: 3px; }
      `}</style>

      {/* Background image + overlay */}
      <div style={s.bgOverlay} />

      {/* Triggered Alert Banners */}
      {liveAlerts.length > 0 && (
        <div style={s.alertBanner}>
          {liveAlerts.map(a => (
            <div key={a.id} style={s.alertBannerItem}>
              🔔 <strong>{a.symbol}</strong> is {a.condition === 'above' ? '📈 above' : '📉 below'} your target of
              ${(a.targetPrice || 0).toLocaleString()} — Current: <strong>${(a.currentPrice || 0).toLocaleString()}</strong>
              <button onClick={() => removeAlert(a.id)} style={s.dismissBtn}>Dismiss</button>
            </div>
          ))}
        </div>
      )}

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.navLogo}>
            <span style={s.logoIcon}>🪙</span>
            <span style={s.logoText}>CryptoNest</span>
            <span style={s.logoBadge}>BETA</span>
          </div>
          <div style={s.navRight}>
            <div style={s.userPill}>
              <div style={{...s.avatar, background:'linear-gradient(135deg,#6c63ff,#a855f7)'}}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={s.userName}>{user.name}</div>
                <div style={s.userRole}>{user.role}</div>
              </div>
            </div>
            <button onClick={logout} style={s.logoutBtn} className="action-btn">⎋ Logout</button>
            {user.role === 'admin' && (
  <button onClick={() => navigate('/admin')} style={{padding:'8px 16px', background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)', color:'#fbbf24', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600'}} className="action-btn">
    👑 Admin Panel
  </button>
)}
          </div>
        </div>
      </nav>

      <div style={s.container}>

        {/* Toasts */}
        {success && <div style={{...s.toast, animation:'fadeInDown 0.3s ease'}}>✅ {success}</div>}
        {error && <div style={{...s.toast, background:'rgba(255,77,77,0.15)', border:'1px solid rgba(255,77,77,0.4)', color:'#ff6b6b', animation:'fadeInDown 0.3s ease'}}>❌ {error}</div>}

        {/* Live Prices Ticker */}
        <div style={s.ticker}>
          {Object.entries(livePrices).map(([sym, price]) => (
            <span key={sym} style={s.tickerItem}>
              <span style={{color: getCoinColor(sym), fontWeight:'700'}}>{sym}</span>
              &nbsp;${(price||0).toLocaleString()}
            </span>
          ))}
          {Object.keys(livePrices).length === 0 && <span style={{color:'rgba(255,255,255,0.4)', fontSize:'13px'}}>Fetching live prices...</span>}
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={{...s.statCard, borderColor:'rgba(108,99,255,0.4)'}} className="stat-card">
            <div style={s.statIcon}>💼</div>
            <div>
              <p style={s.statLabel}>Total Assets</p>
              <p style={{...s.statValue, color:'#a78bfa'}}>{coins.length} Coins</p>
            </div>
          </div>
          <div style={{...s.statCard, borderColor:'rgba(6,182,212,0.4)'}} className="stat-card">
            <div style={s.statIcon}>💰</div>
            <div>
              <p style={s.statLabel}>Total Invested</p>
              <p style={{...s.statValue, color:'#22d3ee'}}>${(totalInvested ||0).toLocaleString()}</p>
            </div>
          </div>
          <div style={{...s.statCard, borderColor:'rgba(251,191,36,0.4)'}} className="stat-card">
            <div style={s.statIcon}>🔔</div>
            <div>
              <p style={s.statLabel}>Active Alerts</p>
              <p style={{...s.statValue, color:'#fbbf24'}}>{alerts.length}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap'}}>
          {!showForm && (
            <button onClick={() => setShowForm(true)} style={s.addMainBtn} className="add-btn">
              + Add Coin
            </button>
          )}
          <button onClick={() => setShowAlertForm(v => !v)} style={s.alertMainBtn} className="add-btn">
            🔔 {showAlertForm ? 'Hide Alert Form' : 'Set Price Alert'}
          </button>
        </div>

        {/* Price Alert Form */}
        {showAlertForm && (
          <div style={{...s.formCard, borderColor:'rgba(251,191,36,0.3)', animation:'fadeInDown 0.3s ease'}}>
            <div style={s.formHeader}>
              <h3 style={s.formTitle}>🔔 Set Price Alert</h3>
              <button onClick={() => setShowAlertForm(false)} style={s.closeBtn}>✕</button>
            </div>
            <form onSubmit={addAlert} style={{display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'flex-end'}}>
              <div style={s.inputGroup}>
                <label style={s.label}>Coin Symbol</label>
                <input style={s.input} placeholder="BTC" value={alertForm.symbol}
                  onChange={e => setAlertForm({...alertForm, symbol: e.target.value.toUpperCase()})} required />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Target Price (USD)</label>
                <input style={s.input} type="number" placeholder="70000" value={alertForm.targetPrice}
                  onChange={e => setAlertForm({...alertForm, targetPrice: e.target.value})} required />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Condition</label>
                <select style={s.input} value={alertForm.condition}
                  onChange={e => setAlertForm({...alertForm, condition: e.target.value})}>
                  <option value="above">Goes Above</option>
                  <option value="below">Goes Below</option>
                </select>
              </div>
              <button style={{...s.submitBtn, background:'linear-gradient(135deg,#f59e0b,#f97316)'}} type="submit" className="action-btn">
                Set Alert
              </button>
            </form>

            {/* Active Alerts List */}
            {alerts.length > 0 && (
              <div style={{marginTop:'20px'}}>
                <p style={{...s.label, marginBottom:'10px'}}>Active Alerts</p>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {alerts.map(a => (
                    <div key={a.id} style={s.alertItem}>
                      <span>🔔 <strong style={{color:'#fbbf24'}}>{a.symbol}</strong> {a.condition === 'above' ? '📈 above' : '📉 below'} <strong>${(a.targetPrice||0).toLocaleString()}</strong></span>
                      <span style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        {livePrices[a.symbol] && (
                          <span style={{color:'rgba(255,255,255,0.5)', fontSize:'12px'}}>
                            Live: ${livePrices[a.symbol].toLocaleString()}
                          </span>
                        )}
                        <button onClick={() => removeAlert(a.id)} style={s.removeAlertBtn}>✕</button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Coin Form */}
        {showForm && (
          <div style={{...s.formCard, animation:'fadeInDown 0.3s ease'}}>
            <div style={s.formHeader}>
              <h3 style={s.formTitle}>{editId ? '✏️ Edit Coin' : '➕ Add New Coin'}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); setForm({ symbol:'', name:'', quantity:'', buyPrice:'', notes:'' }) }} style={s.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={s.formGrid}>
              <div style={s.inputGroup}>
                <label style={s.label}>Symbol</label>
                <input style={s.input} placeholder="BTC" value={form.symbol}
                  onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} required />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Coin Name</label>
                <input style={s.input} placeholder="Bitcoin" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Quantity</label>
                <input style={s.input} type="number" step="any" placeholder="0.5" value={form.quantity}
                  onChange={e => setForm({...form, quantity: e.target.value})} required />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Buy Price (USD)</label>
                <input style={s.input} type="number" step="any" placeholder="60000" value={form.buyPrice}
                  onChange={e => setForm({...form, buyPrice: e.target.value})} required />
              </div>
              <div style={{...s.inputGroup, gridColumn:'span 2'}}>
                <label style={s.label}>Notes (optional)</label>
                <input style={s.input} placeholder="Long term hold, DCA strategy..." value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div style={{gridColumn:'span 2', display:'flex', gap:'12px'}}>
                <button style={s.submitBtn} type="submit" disabled={loading} className="action-btn">
                  {loading ? '⏳ Saving...' : editId ? '✓ Update Coin' : '+ Add to Portfolio'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} style={s.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Portfolio Table */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <h3 style={s.tableTitle}>📊 My Portfolio</h3>
            <span style={s.tableCount}>{coins.length} assets</span>
          </div>
          {coins.length === 0 ? (
            <div style={s.empty}>
              <div style={{fontSize:'48px', marginBottom:'16px'}}>🚀</div>
              <p style={{fontSize:'18px', fontWeight:'600', color:'#fff', marginBottom:'8px'}}>Portfolio is empty</p>
              <p style={{color:'rgba(255,255,255,0.4)', fontSize:'14px'}}>Add your first coin to start tracking!</p>
              <button onClick={() => setShowForm(true)} style={{...s.submitBtn, marginTop:'20px'}} className="action-btn">+ Add First Coin</button>
            </div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['#', 'Asset', 'Qty', 'Buy Price', 'Live Price', 'Invested', 'P&L', 'Notes', 'Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coins.map((coin, i) => {
                    const pnl = getPnL(coin)
                    return (
                      <tr key={coin._id} style={s.tr} className="coin-row">
                        <td style={s.td}><span style={{color:'rgba(255,255,255,0.3)', fontSize:'13px'}}>{i+1}</span></td>
                        <td style={s.td}>
                          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <div style={{padding:'4px 10px', borderRadius:'6px', fontWeight:'800', fontSize:'12px',
                              background: getCoinColor(coin.symbol) + '20',
                              color: getCoinColor(coin.symbol),
                              border: `1px solid ${getCoinColor(coin.symbol)}50`}}>
                              {coin.symbol}
                            </div>
                            <span style={{fontWeight:'500', color:'rgba(255,255,255,0.8)'}}>{coin.name}</span>
                          </div>
                        </td>
                        <td style={s.td}><span style={s.numVal}>{coin.quantity}</span></td>
                        <td style={s.td}><span style={s.numVal}>${(coin.buyPrice||0).toLocaleString()}</span></td>
                        <td style={s.td}>
                          {pnl ? (
                            <span style={{color:'#22d3ee', fontWeight:'600'}}>${(pnl.live||0).toLocaleString()}</span>
                          ) : <span style={{color:'rgba(255,255,255,0.3)', fontSize:'12px'}}>—</span>}
                        </td>
                        <td style={s.td}><span style={{color:'#22d3ee', fontWeight:'700'}}>${(coin.totalInvested||0).toLocaleString()}</span></td>
                        <td style={s.td}>
                          {pnl ? (
                            <div>
                              <span style={{color: pnl.pnl >= 0 ? '#34d399' : '#f87171', fontWeight:'700', fontSize:'13px'}}>
                                {pnl.pnl >= 0 ? '▲' : '▼'} ${Math.abs(pnl.pnl||0).toLocaleString(undefined, {maximumFractionDigits:2})}
                              </span>
                              <span style={{display:'block', fontSize:'11px', color: pnl.pct >= 0 ? '#34d399' : '#f87171'}}>
                                {pnl.pct >= 0 ? '+' : ''}{pnl.pct.toFixed(2)}%
                              </span>
                            </div>
                          ) : <span style={{color:'rgba(255,255,255,0.3)', fontSize:'12px'}}>No live data</span>}
                        </td>
                        <td style={s.td}>
                          {coin.notes ? <span style={{background:'rgba(255,255,255,0.08)', padding:'3px 8px', borderRadius:'4px', fontSize:'12px', color:'rgba(255,255,255,0.5)'}}>{coin.notes}</span>
                            : <span style={{color:'rgba(255,255,255,0.2)'}}>—</span>}
                        </td>
                        <td style={s.td}>
                          <div style={{display:'flex', gap:'8px'}}>
                            <button onClick={() => handleEdit(coin)} style={s.editBtn} className="action-btn">✏️</button>
                            <button onClick={() => handleDelete(coin._id)} style={s.deleteBtn} className="action-btn">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', fontFamily:"'Inter', sans-serif", position:'relative' },
  bgOverlay: {
    position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none',
    backgroundImage:`url(${bgImage})`,
    backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat',
    filter:'brightness(0.45)',
  },
  alertBanner: { position:'fixed', top:0, left:0, right:0, zIndex:999, display:'flex', flexDirection:'column', gap:'4px' },
  alertBannerItem: { background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#000', padding:'12px 24px', fontSize:'14px', fontWeight:'600', display:'flex', justifyContent:'space-between', alignItems:'center', animation:'fadeInDown 0.3s ease' },
  dismissBtn: { background:'rgba(0,0,0,0.2)', border:'none', color:'#000', padding:'4px 12px', borderRadius:'4px', cursor:'pointer', fontWeight:'700' },
  nav: { background:'rgba(0,0,0,0.55)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.08)', position:'sticky', top:0, zIndex:100 },
  navInner: { maxWidth:'1200px', margin:'0 auto', padding:'0 24px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  navLogo: { display:'flex', alignItems:'center', gap:'10px' },
  logoIcon: { fontSize:'24px' },
  logoText: { fontSize:'20px', fontWeight:'800', color:'#fff', letterSpacing:'-0.5px' },
  logoBadge: { fontSize:'10px', background:'rgba(108,99,255,0.2)', color:'#a78bfa', border:'1px solid rgba(108,99,255,0.3)', padding:'2px 7px', borderRadius:'4px', fontWeight:'700', letterSpacing:'1px' },
  navRight: { display:'flex', alignItems:'center', gap:'16px' },
  userPill: { display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', padding:'7px 14px', borderRadius:'12px' },
  avatar: { width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'14px', color:'#fff' },
  userName: { fontSize:'13px', fontWeight:'600', color:'#fff' },
  userRole: { fontSize:'11px', color:'#a78bfa', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px' },
  logoutBtn: { padding:'8px 16px', background:'transparent', border:'1px solid rgba(255,100,100,0.4)', color:'#f87171', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'500' },
  container: { maxWidth:'1200px', margin:'0 auto', padding:'32px 24px', position:'relative', zIndex:1 },
  toast: { background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.3)', color:'#34d399', padding:'13px 20px', borderRadius:'10px', marginBottom:'16px', fontSize:'14px', fontWeight:'500' },
  ticker: { background:'rgba(0,0,0,0.4)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 20px', marginBottom:'20px', display:'flex', gap:'24px', overflowX:'auto', flexWrap:'nowrap' },
  tickerItem: { fontSize:'13px', color:'rgba(255,255,255,0.8)', whiteSpace:'nowrap', fontWeight:'500' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'20px' },
  statCard: { borderRadius:'16px', padding:'22px', display:'flex', alignItems:'center', gap:'16px', background:'rgba(0,0,0,0.45)', backdropFilter:'blur(20px)', border:'1px solid', cursor:'default', transition:'all 0.3s' },
  statIcon: { fontSize:'30px' },
  statLabel: { fontSize:'11px', color:'rgba(255,255,255,0.45)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'4px' },
  statValue: { fontSize:'24px', fontWeight:'800', letterSpacing:'-0.5px' },
  addMainBtn: { padding:'11px 22px', background:'linear-gradient(135deg,#6c63ff,#a855f7)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'600', transition:'all 0.2s' },
  alertMainBtn: { padding:'11px 22px', background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'600', transition:'all 0.2s' },
  formCard: { background:'rgba(0,0,0,0.55)', backdropFilter:'blur(20px)', border:'1px solid rgba(108,99,255,0.2)', borderRadius:'16px', padding:'28px', marginBottom:'20px' },
  formHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  formTitle: { fontSize:'17px', fontWeight:'700', color:'#fff' },
  closeBtn: { background:'transparent', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'18px', cursor:'pointer' },
  formGrid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px' },
  inputGroup: { display:'flex', flexDirection:'column', gap:'6px' },
  label: { fontSize:'11px', fontWeight:'600', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.8px' },
  input: { padding:'11px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.07)', color:'#fff', fontSize:'14px' },
  submitBtn: { padding:'12px 24px', background:'linear-gradient(135deg,#6c63ff,#a855f7)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:'14px' },
  cancelBtn: { padding:'12px 24px', background:'transparent', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', cursor:'pointer', fontSize:'14px' },
  alertItem: { display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:'8px', padding:'10px 14px', fontSize:'14px', color:'rgba(255,255,255,0.8)' },
  removeAlertBtn: { background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.5)', borderRadius:'4px', padding:'2px 8px', cursor:'pointer', fontSize:'12px' },
  tableCard: { background:'rgba(0,0,0,0.5)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'24px' },
  tableHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  tableTitle: { fontSize:'17px', fontWeight:'700', color:'#fff' },
  tableCount: { fontSize:'13px', color:'#a78bfa', background:'rgba(108,99,255,0.12)', padding:'4px 12px', borderRadius:'20px', fontWeight:'600' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'11px 14px', textAlign:'left', fontSize:'11px', fontWeight:'600', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.8px', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  tr: { borderBottom:'1px solid rgba(255,255,255,0.04)' },
  td: { padding:'14px', fontSize:'14px', color:'#fff' },
  numVal: { fontWeight:'600', color:'rgba(255,255,255,0.85)' },
  editBtn: { padding:'7px 11px', background:'rgba(108,99,255,0.15)', color:'#a78bfa', border:'1px solid rgba(108,99,255,0.25)', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  deleteBtn: { padding:'7px 11px', background:'rgba(255,77,77,0.12)', color:'#f87171', border:'1px solid rgba(255,77,77,0.25)', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  empty: { textAlign:'center', padding:'60px 20px' },
}