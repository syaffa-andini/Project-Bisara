import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Hand, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { AuthServiceError, register } from './authService.js'
import './Login.css'

function Register({ onNavigate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    const normalizedEmail = email.trim()
    if (!name.trim() || !normalizedEmail || !password || !confirmation) {
      setError('Lengkapi semua kolom untuk membuat akun.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Masukkan format email yang valid.')
      return
    }
    if (password.length < 8) {
      setError('Password harus memiliki minimal 8 karakter.')
      return
    }
    if (password !== confirmation) {
      setError('Konfirmasi password belum sama.')
      return
    }

    setIsLoading(true)
    try {
      await register({ name: name.trim(), email: normalizedEmail, password })
      setSuccess('Pendaftaran berhasil. Silakan masuk dengan akun barumu.')
      setName('')
      setEmail('')
      setPassword('')
      setConfirmation('')
    } catch (requestError) {
      setError(requestError instanceof AuthServiceError
        ? requestError.message
        : 'Terjadi kesalahan saat membuat akun. Silakan coba lagi.')
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
            <span className="auth-eyebrow"><CheckCircle2 size={14} /> RUANG UNTUK SEMUA</span>
            <h1>Mulai Cerita<br />dan Terhubung<br /><span>Tanpa Batas.</span></h1>
            <p>Buat akun BISARA untuk menikmati pengalaman komunikasi yang lebih inklusif.</p>
          </div>
          <div className="auth-register-art" aria-hidden="true"><div><Hand size={82} strokeWidth={1.2} /></div><span /><span /></div>
          <p className="auth-showcase-footer">Setiap orang berhak untuk saling memahami.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-top"><span>Sudah memiliki akun?</span><button type="button" onClick={() => onNavigate('login')}>Masuk <ArrowRight size={15} /></button></div>
        <div className="auth-form-wrap auth-register-wrap">
          <button className="auth-back-link" type="button" onClick={() => onNavigate('landing')}><ArrowLeft size={15} /> Kembali ke beranda</button>
          <div className="auth-heading">
            <span className="auth-heading-mark"><UserRound size={20} /></span>
            <span className="auth-kicker">MULAI BERSAMA BISARA</span>
            <h2>Buat Akun Baru</h2>
            <p>Daftar untuk membuka ruang komunikasi yang lebih inklusif.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-field">
              <span>Nama Lengkap</span>
              <span className="auth-input-wrap"><UserRound size={18} /><input type="text" name="name" autoComplete="name" placeholder="Nama lengkap" value={name} onChange={(event) => setName(event.target.value)} /></span>
            </label>
            <label className="auth-field">
              <span>Email</span>
              <span className="auth-input-wrap"><Mail size={18} /><input type="email" name="email" autoComplete="email" placeholder="nama@email.com" value={email} onChange={(event) => setEmail(event.target.value)} /></span>
            </label>
            <label className="auth-field">
              <span>Password <small>Minimal 8 karakter</small></span>
              <span className="auth-input-wrap"><LockKeyhole size={18} /><input type={showPassword ? 'text' : 'password'} name="new-password" autoComplete="new-password" placeholder="Buat password" value={password} onChange={(event) => setPassword(event.target.value)} /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
            </label>
            <label className="auth-field">
              <span>Konfirmasi Password</span>
              <span className="auth-input-wrap"><LockKeyhole size={18} /><input type={showPassword ? 'text' : 'password'} name="confirm-password" autoComplete="new-password" placeholder="Ulangi password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></span>
            </label>

            {error && <p className="auth-error" role="alert">{error}</p>}
            {success && <p className="auth-success" role="status">{success}</p>}

            <button className="auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? <><span className="auth-spinner" /> Memproses...</> : <>Daftar Sekarang <ArrowRight size={17} /></>}
            </button>
          </form>

          <button className="auth-register-link auth-return-login" type="button" onClick={() => onNavigate('login')}>Kembali ke halaman masuk <ArrowRight size={15} /></button>
          <p className="auth-secure-note">BISARA menjaga pengalaman tetap ramah dan inklusif.</p>
        </div>
        <footer className="auth-panel-footer"><span>© {new Date().getFullYear()} BISARA</span><span>Komunikasi tanpa batas, untuk semua.</span></footer>
      </section>
    </main>
  )
}

export default Register
