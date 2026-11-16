import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Hand, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { AuthServiceError, login } from './authService.js'
import './Login.css'

function Login({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const normalizedEmail = email.trim()
    if (!normalizedEmail || !password) {
      setError('Email dan password wajib diisi.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Masukkan format email yang valid.')
      return
    }

    setIsLoading(true)
    try {
      await login({ email: normalizedEmail, password, rememberMe })
      onNavigate('dashboard')
    } catch (requestError) {
      setError(requestError instanceof AuthServiceError
        ? requestError.message
        : 'Terjadi kesalahan saat masuk. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase" aria-label="Tentang BISARA">
        <div className="auth-showcase-glow auth-showcase-glow-one" />
        <div className="auth-showcase-glow auth-showcase-glow-two" />
        <div className="auth-showcase-inner">
          <button className="auth-brand auth-brand-light" type="button" onClick={() => onNavigate('landing')} aria-label="Kembali ke beranda BISARA">
            <span className="auth-brand-mark"><Hand size={21} strokeWidth={2.2} /></span>
            <span>BISARA<span className="auth-brand-period">.</span></span>
          </button>

          <div className="auth-showcase-copy">
            <span className="auth-eyebrow"><Sparkles size={14} /> AI ACCESSIBILITY PLATFORM</span>
            <h1>Komunikasi<br />Tanpa Batas,<br /><span>Untuk Semua.</span></h1>
            <p>BISARA menghubungkan bahasa isyarat, suara, dan teks agar setiap orang dapat saling memahami.</p>
          </div>

          <div className="auth-illustration" aria-hidden="true">
            <div className="auth-illustration-orbit auth-orbit-one" />
            <div className="auth-illustration-orbit auth-orbit-two" />
            <div className="auth-illustration-card">
              <div className="auth-illustration-top"><span><i /> BISARA VISION</span><span>AI LIVE</span></div>
              <div className="auth-illustration-center">
                <span className="auth-illustration-halo" />
                <span className="auth-illustration-hand"><Hand size={96} strokeWidth={1.2} /></span>
                <Sparkles className="auth-illustration-spark" size={18} />
              </div>
              <div className="auth-illustration-caption"><span><ShieldCheck size={16} /></span><strong>Memahami, tanpa batas.</strong><i><b /><b /><b /><b /></i></div>
            </div>
            <span className="auth-float-tag auth-float-tag-one"><span className="auth-float-icon"><Mail size={15} /></span><span><small>TERHUBUNG</small><strong>Untuk semua</strong></span></span>
            <span className="auth-float-tag auth-float-tag-two"><span className="auth-float-live" /> PRIVASI TERJAGA</span>
          </div>

          <p className="auth-showcase-footer"><ShieldCheck size={15} /> Teknologi yang lebih inklusif, untuk semua.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-top"><span>Belum punya akun?</span><button type="button" onClick={() => onNavigate('register')}>Daftar <ArrowRight size={15} /></button></div>
        <div className="auth-form-wrap">
          <button className="auth-back-link" type="button" onClick={() => onNavigate('landing')}><ArrowLeft size={15} /> Kembali ke beranda</button>
          <div className="auth-heading">
            <span className="auth-heading-mark"><LockKeyhole size={20} /></span>
            <span className="auth-kicker">RUANG PERSONAL BISARA</span>
            <h2>Selamat Datang Kembali!</h2>
            <p>Masuk ke akun BISARA untuk memulai komunikasi tanpa batas.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-field">
              <span>Email</span>
              <span className="auth-input-wrap"><Mail size={18} /><input type="email" name="email" autoComplete="email" placeholder="nama@email.com" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(error && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())))} /></span>
            </label>
            <label className="auth-field">
              <span>Password</span>
              <span className="auth-input-wrap"><LockKeyhole size={18} /><input type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" placeholder="Masukkan password" value={password} onChange={(event) => setPassword(event.target.value)} /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
            </label>

            <div className="auth-form-options">
              <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Ingat Saya</span></label>
              <button className="auth-text-button" type="button" onClick={() => setError('Fitur pemulihan password memerlukan endpoint backend autentikasi.')}>Lupa Password?</button>
            </div>

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button className="auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? <><span className="auth-spinner" /> Memproses...</> : <>Masuk ke BISARA <ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="auth-register-prompt"><span />Belum memiliki akun?<span /></div>
          <button className="auth-register-link" type="button" onClick={() => onNavigate('register')}>Daftar Sekarang <ArrowRight size={15} /></button>
          <p className="auth-secure-note"><ShieldCheck size={15} /> Data akun dikirim dengan aman ke layanan autentikasi.</p>
        </div>
        <footer className="auth-panel-footer"><span>© {new Date().getFullYear()} BISARA</span><span>Komunikasi tanpa batas, untuk semua.</span></footer>
      </section>
    </main>
  )
}

export default Login
