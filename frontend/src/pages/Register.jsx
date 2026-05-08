import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import bgImage from '../bg.webp'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  // Password strength checker
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'transparent' }
    let score = 0
    if (pwd.length >= 6) score++
    if (pwd.length >= 10) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { score, label:'Weak', color:'#f87171' }
    if (score <= 3) return { score, label:'Medium', color:'#fbbf24' }
    return { score, label:'Strong', color:'#34d399' }
  }

  const strength = getStrength(form.password)

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'

    if (!form.email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'

    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Include at least one uppercase letter'
    else if (!/[0-9]/.test(form.password)) errs.password = 'Include at least one number'

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
      const res = await axios.post('http://localhost:5000/api/v1/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
    setLoading(false)
  }

  const inputStyle = (field) => ({
    ...styles.input,
    border: fieldErrors[field] ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.1)'
  })

  const clearErr = (field) => setFieldErrors(prev => ({...prev, [field]:''}))

  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay} />
      <div style={styles.card}>
        <h1 style={styles.logo}>🪙 CryptoNest</h1>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.sub}>Start tracking your crypto portfolio</p>

        {error && <div style={styles.error}>❌ {error}</div>}

        <form onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div style={styles.fieldWrap}>
            <input style={inputStyle('name')} type="text" placeholder="Full Name"
              value={form.name} onChange={e => { setForm({...form, name: e.target.value}); clearErr('name') }} />
            {fieldErrors.name && <p style={styles.fieldErr}>⚠ {fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div style={styles.fieldWrap}>
            <input style={inputStyle('email')} type="email" placeholder="Email"
              value={form.email} onChange={e => { setForm({...form, email: e.target.value}); clearErr('email') }} />
            {fieldErrors.email && <p style={styles.fieldErr}>⚠ {fieldErrors.email}</p>}
          </div>

          {/* Password + strength */}
          <div style={styles.fieldWrap}>
            <div style={styles.passWrap}>
              <input
                style={{...inputStyle('password'), marginBottom:0, paddingRight:'48px'}}
                type={showPass ? 'text' : 'password'}
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={e => { setForm({...form, password: e.target.value}); clearErr('password') }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Strength bar */}
            {form.password.length > 0 && (
              <div style={{marginTop:'8px'}}>
                <div style={styles.strengthBarBg}>
                  <div style={{...styles.strengthBarFill,
                    width:`${(strength.score / 5) * 100}%`,
                    background: strength.color,
                    transition:'all 0.3s ease'
                  }}/>
                </div>
                <p style={{...styles.strengthLabel, color: strength.color}}>
                  {strength.label} password
                </p>
              </div>
            )}

            {fieldErrors.password && <p style={styles.fieldErr}>⚠ {fieldErrors.password}</p>}

            {/* Password rules hint */}
            {form.password.length > 0 && (
              <div style={styles.rulesWrap}>
                {[
                  { pass: form.password.length >= 6, text: 'At least 6 characters' },
                  { pass: /[A-Z]/.test(form.password), text: 'One uppercase letter' },
                  { pass: /[0-9]/.test(form.password), text: 'One number' },
                  { pass: /[^A-Za-z0-9]/.test(form.password), text: 'One special character (bonus)' },
                ].map((rule, i) => (
                  <p key={i} style={{...styles.rule, color: rule.pass ? '#34d399' : 'rgba(255,255,255,0.35)'}}>
                    {rule.pass ? '✓' : '○'} {rule.text}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Role */}
          {/* Role */}
<div style={styles.fieldWrap}>
  <select
    style={{
      ...inputStyle('role'),
      color: '#fff',
      backgroundColor: 'rgba(255,255,255,0.07)',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      cursor: 'pointer'
    }}
    value={form.role}
    onChange={e => setForm({...form, role: e.target.value})}
  >
    <option
      value="user"
      style={{
        backgroundColor: '#1a1a2e',
        color: '#ffffff'
      }}
    >
      👤 User
    </option>

    <option
      value="admin"
      style={{
        backgroundColor: '#1a1a2e',
        color: '#ffffff'
      }}
    >
      👑 Admin
    </option>
  </select>
</div>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? '⏳ Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link to="/login" style={styles.a}>Login</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    backgroundImage:`url(${bgImage})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' },
  overlay: { position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(1px)' },
  card: { position:'relative', zIndex:2, background:'rgba(26,26,46,0.78)', backdropFilter:'blur(12px)',
    padding:'42px', borderRadius:'22px', width:'100%', maxWidth:'430px',
    border:'5px solid rgba(239, 227, 158, 0.4)',
    boxShadow:'0 20px 60px rgba(0,0,0,0.25), 0 0 18px rgba(255,215,0,0.08)' },
  logo: { fontSize:'34px', textAlign:'center', marginBottom:'10px', color:'#fff', fontWeight:'800', letterSpacing:'-1px' },
  title: { textAlign:'center', fontSize:'24px', marginBottom:'6px', color:'#fff', fontWeight:'700' },
  sub: { textAlign:'center', color:'rgba(255,255,255,0.55)', marginBottom:'24px', fontSize:'14px' },
  fieldWrap: { marginBottom:'14px' },
  input: { width:'100%', padding:'13px 16px', borderRadius:'10px',
    background:'rgba(255,255,255,0.07)', color:'#fff', fontSize:'15px', display:'block', outline:'none', transition:'border 0.2s' },
  passWrap: { position:'relative' },
  eyeBtn: { position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
    background:'transparent', border:'none', cursor:'pointer', fontSize:'18px', padding:0 },
  fieldErr: { color:'#f87171', fontSize:'12px', marginTop:'6px', paddingLeft:'4px' },
  strengthBarBg: { height:'4px', borderRadius:'4px', background:'rgba(255,255,255,0.1)', overflow:'hidden' },
  strengthBarFill: { height:'100%', borderRadius:'4px' },
  strengthLabel: { fontSize:'12px', marginTop:'4px', fontWeight:'600' },
  rulesWrap: { marginTop:'8px', display:'flex', flexDirection:'column', gap:'3px' },
  rule: { fontSize:'12px' },
  btn: { width:'100%', padding:'14px', background:'linear-gradient(135deg,#6c63ff,#a855f7)',
    color:'#fff', border:'none', borderRadius:'10px', fontSize:'16px', cursor:'pointer',
    fontWeight:'700', marginTop:'8px', boxShadow:'0 10px 30px rgba(108,99,255,0.35)' },
  error: { background:'rgba(255,77,77,0.12)', border:'1px solid rgba(255,77,77,0.4)',
    color:'#f87171', padding:'12px', borderRadius:'10px', marginBottom:'16px', fontSize:'14px' },
  link: { textAlign:'center', marginTop:'20px', color:'rgba(255,255,255,0.65)', fontSize:'14px',
    borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'16px' },
  a: { color:'#a78bfa', fontWeight:'600', textDecoration:'none' },
}