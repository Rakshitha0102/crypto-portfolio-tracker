import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import bgImage from '../bg.webp'

export default function AdminPanel() {
  const [allCoins, setAllCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState('all')
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    // Redirect if not admin
    if (user.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    fetchAllCoins()
  }, [])

  const fetchAllCoins = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/coins/admin/all', { headers })
      setAllCoins(res.data.coins)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const logout = () => { localStorage.clear(); navigate('/login') }

  // Get unique users
  const users = [...new Map(allCoins.map(c => [c.user?._id, c.user])).values()].filter(Boolean)

  // Filter coins
  const filtered = allCoins.filter(c => {
    const matchUser = selectedUser === 'all' || c.user?._id === selectedUser
    const matchSearch = c.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(search.toLowerCase())
    return matchUser && matchSearch
  })

  // Stats
  const totalInvested = filtered.reduce((sum, c) => sum + (c.quantity * c.buyPrice), 0)
  const totalCoins = filtered.length
  const uniqueUsers = users.length

  const coinColors = {
    BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', BNB: '#f3ba2f',
    ADA: '#0033ad', DOT: '#e6007a', DOGE: '#c3a634', XRP: '#346aa9',
    AVAX: '#e84142', MATIC: '#8247e5'
  }
  const getCoinColor = (symbol) => coinColors[symbol?.toUpperCase()] || '#6c63ff'

  // Group coins by user for summary
  const userSummary = users.map(u => {
    const userCoins = allCoins.filter(c => c.user?._id === u?._id)
    const invested = userCoins.reduce((sum, c) => sum + (c.quantity * c.buyPrice), 0)
    return { ...u, coinCount: userCoins.length, invested }
  })

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .row:hover { background: rgba(255,255,255,0.04) !important; }
        .btn:hover { transform: translateY(-1px); opacity: 0.9; }
        .user-card:hover { transform: translateY(-2px); border-color: rgba(108,99,255,0.5) !important; }
        input:focus, select:focus { outline: none; border-color: #6c63ff !important; box-shadow: 0 0 0 3px rgba(108,99,255,0.15) !important; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.4); border-radius: 3px; }
      `}</style>

      {/* Background */}
      <div style={s.bgOverlay} />

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.navLogo}>
            <span style={{fontSize:'24px'}}>🪙</span>
            <span style={s.logoText}>CryptoNest</span>
            <span style={s.adminBadge}>👑 ADMIN</span>
          </div>
          <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
            <button onClick={() => navigate('/dashboard')} style={s.navBtn} className="btn">
              📊 My Portfolio
            </button>
            <div style={s.userPill}>
              <div style={{...s.avatar, background:'linear-gradient(135deg,#f59e0b,#f97316)'}}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={s.userName}>{user.name}</div>
                <div style={{...s.userRole, color:'#fbbf24'}}>ADMIN</div>
              </div>
            </div>
            <button onClick={logout} style={s.logoutBtn} className="btn">⎋ Logout</button>
          </div>
        </div>
      </nav>

      <div style={s.container}>

        {/* Header */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>Admin Dashboard</h1>
            <p style={s.pageSub}>Monitor all users and their crypto portfolios</p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={s.statsGrid}>
          <div style={{...s.statCard, borderColor:'rgba(108,99,255,0.4)'}}>
            <div style={s.statIcon}>👥</div>
            <div>
              <p style={s.statLabel}>Total Users</p>
              <p style={{...s.statValue, color:'#a78bfa'}}>{uniqueUsers}</p>
            </div>
          </div>
          <div style={{...s.statCard, borderColor:'rgba(6,182,212,0.4)'}}>
            <div style={s.statIcon}>🪙</div>
            <div>
              <p style={s.statLabel}>Total Coins Tracked</p>
              <p style={{...s.statValue, color:'#22d3ee'}}>{allCoins.length}</p>
            </div>
          </div>
          <div style={{...s.statCard, borderColor:'rgba(52,211,153,0.4)'}}>
            <div style={s.statIcon}>💰</div>
            <div>
              <p style={s.statLabel}>Total Platform Value</p>
              <p style={{...s.statValue, color:'#34d399'}}>${allCoins.reduce((s,c) => s + c.quantity * c.buyPrice, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* User Summary Cards */}
        <div style={s.sectionCard}>
          <h3 style={s.sectionTitle}>👥 Users Overview</h3>
          <div style={s.usersGrid}>
            {userSummary.map(u => (
              <div key={u._id}
                style={{...s.userCard, borderColor: selectedUser === u._id ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.08)'}}
                className="user-card"
                onClick={() => setSelectedUser(prev => prev === u._id ? 'all' : u._id)}>
                <div style={{...s.userAvatar, background:`linear-gradient(135deg, #6c63ff, #a855f7)`}}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <p style={s.uName}>{u.name}</p>
                  <p style={s.uEmail}>{u.email}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={s.uCoins}>{u.coinCount} coins</p>
                  <p style={s.uInvested}>${u.invested.toLocaleString()}</p>
                </div>
                {selectedUser === u._id && <div style={s.selectedDot}/>}
              </div>
            ))}
          </div>
          {selectedUser !== 'all' && (
            <button onClick={() => setSelectedUser('all')} style={s.clearFilter}>
              ✕ Clear filter — show all users
            </button>
          )}
        </div>

        {/* Coins Table */}
        <div style={s.sectionCard}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'12px'}}>
            <h3 style={s.sectionTitle}>
              📋 All Portfolio Entries
              <span style={s.tableCount}>{filtered.length} records</span>
            </h3>
            <input
              style={{...s.searchInput}}
              placeholder="🔍 Search by coin or user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={s.loadingWrap}>
              <p style={{color:'rgba(255,255,255,0.4)', fontSize:'15px'}}>Loading all portfolios...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.loadingWrap}>
              <p style={{fontSize:'32px', marginBottom:'12px'}}>🔍</p>
              <p style={{color:'rgba(255,255,255,0.4)'}}>No records found</p>
            </div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['#', 'User', 'Asset', 'Quantity', 'Buy Price', 'Total Invested', 'Notes', 'Added On'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((coin, i) => (
                    <tr key={coin._id} style={s.tr} className="row">
                      <td style={s.td}><span style={{color:'rgba(255,255,255,0.25)', fontSize:'13px'}}>{i+1}</span></td>
                      <td style={s.td}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                          <div style={{...s.miniAvatar, background:'linear-gradient(135deg,#6c63ff,#a855f7)'}}>
                            {coin.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{fontSize:'13px', fontWeight:'600', color:'#fff'}}>{coin.user?.name}</p>
                            <p style={{fontSize:'11px', color:'rgba(255,255,255,0.35)'}}>{coin.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                          <span style={{padding:'3px 8px', borderRadius:'5px', fontWeight:'800', fontSize:'11px',
                            background: getCoinColor(coin.symbol) + '20',
                            color: getCoinColor(coin.symbol),
                            border:`1px solid ${getCoinColor(coin.symbol)}40`}}>
                            {coin.symbol}
                          </span>
                          <span style={{color:'rgba(255,255,255,0.7)', fontSize:'13px'}}>{coin.name}</span>
                        </div>
                      </td>
                      <td style={s.td}><span style={s.numVal}>{coin.quantity}</span></td>
                      <td style={s.td}><span style={s.numVal}>${coin.buyPrice?.toLocaleString()}</span></td>
                      <td style={s.td}>
                        <span style={{color:'#34d399', fontWeight:'700'}}>
                          ${(coin.quantity * coin.buyPrice).toLocaleString()}
                        </span>
                      </td>
                      <td style={s.td}>
                        {coin.notes
                          ? <span style={{background:'rgba(255,255,255,0.06)', padding:'3px 8px', borderRadius:'4px', fontSize:'12px', color:'rgba(255,255,255,0.45)'}}>{coin.notes}</span>
                          : <span style={{color:'rgba(255,255,255,0.2)'}}>—</span>}
                      </td>
                      <td style={s.td}>
                        <span style={{color:'rgba(255,255,255,0.35)', fontSize:'12px'}}>
                          {new Date(coin.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
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
  page: { minHeight:'100vh', fontFamily:"'Inter',sans-serif", position:'relative' },
  bgOverlay: { position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none',
    backgroundImage:`url(${bgImage})`, backgroundSize:'cover', backgroundPosition:'center', filter:'brightness(0.35)' },
  nav: { background:'rgba(0,0,0,0.6)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, zIndex:100 },
  navInner: { maxWidth:'1300px', margin:'0 auto', padding:'0 24px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  navLogo: { display:'flex', alignItems:'center', gap:'10px' },
  logoText: { fontSize:'20px', fontWeight:'800', color:'#fff', letterSpacing:'-0.5px' },
  adminBadge: { fontSize:'11px', background:'rgba(251,191,36,0.15)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.3)', padding:'3px 8px', borderRadius:'4px', fontWeight:'700' },
  navBtn: { padding:'8px 16px', background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.3)', color:'#a78bfa', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'500', transition:'all 0.2s' },
  userPill: { display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', padding:'7px 14px', borderRadius:'12px' },
  avatar: { width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'14px', color:'#fff' },
  userName: { fontSize:'13px', fontWeight:'600', color:'#fff' },
  userRole: { fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px' },
  logoutBtn: { padding:'8px 16px', background:'transparent', border:'1px solid rgba(255,100,100,0.4)', color:'#f87171', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'500', transition:'all 0.2s' },
  container: { maxWidth:'1300px', margin:'0 auto', padding:'32px 24px', position:'relative', zIndex:1 },
  pageHeader: { marginBottom:'24px' },
  pageTitle: { fontSize:'28px', fontWeight:'800', color:'#fff', letterSpacing:'-0.5px' },
  pageSub: { fontSize:'14px', color:'rgba(255,255,255,0.4)', marginTop:'4px' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'20px' },
  statCard: { borderRadius:'14px', padding:'20px', display:'flex', alignItems:'center', gap:'14px', background:'rgba(0,0,0,0.45)', backdropFilter:'blur(20px)', border:'1px solid', transition:'all 0.3s' },
  statIcon: { fontSize:'28px' },
  statLabel: { fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'4px' },
  statValue: { fontSize:'22px', fontWeight:'800' },
  sectionCard: { background:'rgba(0,0,0,0.5)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'24px', marginBottom:'20px' },
  sectionTitle: { fontSize:'16px', fontWeight:'700', color:'#fff', display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' },
  tableCount: { fontSize:'12px', color:'#a78bfa', background:'rgba(108,99,255,0.12)', padding:'3px 10px', borderRadius:'20px', fontWeight:'600' },
  usersGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'12px' },
  userCard: { display:'flex', alignItems:'center', gap:'12px', background:'rgba(255,255,255,0.04)', border:'1px solid', borderRadius:'12px', padding:'14px', cursor:'pointer', transition:'all 0.2s', position:'relative' },
  userAvatar: { width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'16px', color:'#fff', flexShrink:0 },
  uName: { fontSize:'14px', fontWeight:'600', color:'#fff' },
  uEmail: { fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'2px' },
  uCoins: { fontSize:'13px', fontWeight:'600', color:'#a78bfa' },
  uInvested: { fontSize:'12px', color:'#34d399', marginTop:'2px' },
  selectedDot: { position:'absolute', top:'10px', right:'10px', width:'8px', height:'8px', borderRadius:'50%', background:'#6c63ff' },
  clearFilter: { marginTop:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  searchInput: { padding:'10px 16px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.06)', color:'#fff', fontSize:'14px', width:'280px' },
  loadingWrap: { textAlign:'center', padding:'50px 20px' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'11px 14px', textAlign:'left', fontSize:'11px', fontWeight:'600', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.8px', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  tr: { borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.2s' },
  td: { padding:'14px', fontSize:'13px', color:'#fff' },
  numVal: { fontWeight:'600', color:'rgba(255,255,255,0.85)' },
  miniAvatar: { width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'12px', color:'#fff', flexShrink:0 },
}