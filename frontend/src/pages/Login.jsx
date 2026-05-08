import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import bgImage from '../bg.webp'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return }
    setFieldErrors({})
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  const inputStyle = (field) => ({
    ...styles.input,
    border: fieldErrors[field] ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.1)'
  })

  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay} />
      <div style={styles.card}>
        <h1 style={styles.logo}>🪙 CryptoNest</h1>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Sign in to your portfolio</p>

        {error && <div style={styles.error}>❌ {error}</div>}

        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div style={styles.fieldWrap}>
            <input
              style={inputStyle('email')}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => { setForm({...form, email: e.target.value}); setFieldErrors({...fieldErrors, email:''}) }}
            />
            {fieldErrors.email && <p style={styles.fieldErr}>⚠ {fieldErrors.email}</p>}
          </div>

          {/* Password with show/hide */}
          <div style={styles.fieldWrap}>
            <div style={styles.passWrap}>
              <input
                style={{...inputStyle('password'), marginBottom:0, paddingRight:'48px'}}
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => { setForm({...form, password: e.target.value}); setFieldErrors({...fieldErrors, password:''}) }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {fieldErrors.password && <p style={styles.fieldErr}>⚠ {fieldErrors.password}</p>}
          </div>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.link}>
          Don't have an account? <Link to="/register" style={styles.a}>Register</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    backgroundImage:`url(${bgImage})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' },
  overlay: { position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(1px)' },
  card: { position:'relative', zIndex:2, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(20px)',
    padding:'42px', borderRadius:'22px', width:'100%', maxWidth:'430px',
    border:'2px solid rgba(248,224,87,0.35)',
    boxShadow:'0 20px 60px rgba(0,0,0,0.35), 0 0 25px rgba(255,215,0,0.08)' },
  logo: { fontSize:'36px', textAlign:'center', marginBottom:'10px', color:'#fff', fontWeight:'800', letterSpacing:'-1px' },
  title: { textAlign:'center', fontSize:'26px', marginBottom:'6px', color:'#fff', fontWeight:'700' },
  sub: { textAlign:'center', color:'rgba(255,255,255,0.55)', marginBottom:'28px', fontSize:'14px' },
  fieldWrap: { marginBottom:'16px' },
  input: { width:'100%', padding:'14px 16px', borderRadius:'10px',
    background:'rgba(255,255,255,0.07)', color:'#fff', fontSize:'15px', display:'block',
    outline:'none', transition:'border 0.2s', marginBottom:0 },
  passWrap: { position:'relative' },
  eyeBtn: { position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
    background:'transparent', border:'none', cursor:'pointer', fontSize:'18px', padding:0 },
  fieldErr: { color:'#f87171', fontSize:'12px', marginTop:'6px', paddingLeft:'4px' },
  btn: { width:'100%', padding:'14px', background:'linear-gradient(135deg,#6c63ff,#a855f7)',
    color:'#fff', border:'none', borderRadius:'10px', fontSize:'16px', cursor:'pointer',
    fontWeight:'700', marginTop:'8px', boxShadow:'0 10px 30px rgba(108,99,255,0.35)' },
  error: { background:'rgba(255,77,77,0.12)', border:'1px solid rgba(255,77,77,0.4)',
    color:'#f87171', padding:'12px', borderRadius:'10px', marginBottom:'18px', fontSize:'14px' },
  link: { textAlign:'center', marginTop:'22px', color:'rgba(255,255,255,0.65)', fontSize:'14px',
    borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'18px' },
  a: { color:'#a78bfa', fontWeight:'600', textDecoration:'none' },
}