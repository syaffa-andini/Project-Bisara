import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  Hand,
  Headphones,
  HeartHandshake,
  History,
  Home,
  Info,
  LayoutDashboard,
  Languages,
  Mic,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Trash2,
  Volume2,
  Waves,
  X,
  Zap,
} from 'lucide-react'
import Login from './Login.jsx'
import Register from './Register.jsx'
import './App.css'

const pagePaths = {
  landing: '/',
  dashboard: '/dashboard',
  sign: '/sign',
  voice: '/voice',
  history: '/history',
  about: '/about',
  login: '/login',
  register: '/register',
}

const pathPages = Object.fromEntries(Object.entries(pagePaths).map(([key, value]) => [value, key]))

const navigation = [
  { id: 'landing', label: 'Beranda', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sign', label: 'Isyarat ke Teks', icon: Hand },
  { id: 'voice', label: 'Suara ke Teks', icon: AudioLines },
  { id: 'history', label: 'Riwayat Terjemahan', icon: History },
  { id: 'about', label: 'Tentang BISARA', icon: Info },
]

const waveBars = [18, 30, 43, 26, 54, 35, 22, 47, 29, 58, 34, 20, 42, 28, 51, 24, 39, 19, 47, 31, 56, 23, 38, 17, 44, 27, 52, 33, 21, 41, 25, 50, 30, 19, 45, 28]

function Brand({ onClick, inverse = false }) {
  return (
    <button className={`brand ${inverse ? 'brand-inverse' : ''}`} type="button" onClick={onClick} aria-label="BISARA, kembali ke beranda">
      <span className="brand-mark"><Hand size={21} strokeWidth={2.2} /></span>
      <span className="brand-name">BISARA<span>.</span></span>
    </button>
  )
}

function App() {
  const [page, setPage] = useState(() => pathPages[window.location.pathname] || 'landing')
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceStatus, setVoiceStatus] = useState('ready')
  const [history, setHistory] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')

  useEffect(() => {
    if (page === 'sign' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraOn, page])

  useEffect(() => {
    const handlePopState = () => setPage(pathPages[window.location.pathname] || 'landing')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    recognitionRef.current?.stop()
  }, [])

  const navigate = (nextPage) => {
    setPage(nextPage)
    window.history.pushState({}, '', pagePaths[nextPage] || '/')
    setMobileMenuOpen(false)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startCamera = async () => {
    setCameraError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Browser ini belum mendukung akses kamera.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      setCameraOn(true)
    } catch (error) {
      setCameraError(error.name === 'NotAllowedError'
        ? 'Izin kamera belum diberikan. Periksa pengaturan browser Anda.'
        : 'Kamera tidak dapat diakses. Pastikan kamera terhubung dan coba lagi.')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  const startListening = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      const message = 'Browser ini belum mendukung transkripsi suara. Coba gunakan Chrome atau Edge.'
      transcriptRef.current = message
      setTranscript(message)
      setVoiceStatus('error')
      return
    }
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'id-ID'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map((result) => result[0].transcript).join(' ')
      transcriptRef.current = text
      setTranscript(text)
    }
    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        const message = transcriptRef.current || 'Suara belum tertangkap. Periksa izin mikrofon dan coba lagi.'
        transcriptRef.current = message
        setTranscript(message)
        setVoiceStatus('error')
      }
      setListening(false)
    }
    recognition.onend = () => {
      setListening(false)
      setVoiceStatus((status) => status === 'error' ? status : transcriptRef.current.trim() ? 'done' : 'ready')
    }
    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
      setVoiceStatus('listening')
      setNotice('')
    } catch {
      const message = 'Mikrofon belum dapat dimulai. Periksa izin browser dan coba lagi.'
      transcriptRef.current = message
      setTranscript(message)
      setVoiceStatus('error')
    }
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
    setVoiceStatus(transcript.trim() ? 'done' : 'ready')
    if (transcript.trim()) {
      setHistory((items) => [
        { text: transcript, time: 'Baru saja', kind: 'suara', id: Date.now() },
        ...items,
      ].slice(0, 20))
    }
  }

  const clearTranscript = () => {
    transcriptRef.current = ''
    setTranscript('')
    setVoiceStatus('ready')
    setNotice('')
  }

  const copyText = async (text) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setNotice('Teks berhasil disalin.')
    } catch {
      setNotice('Tidak dapat menyalin teks. Periksa izin clipboard browser.')
    }
  }

  const speakText = (text) => {
    if (!text || !('speechSynthesis' in window)) {
      setNotice('Text-to-Speech tidak tersedia di browser ini.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'id-ID'
    window.speechSynthesis.speak(utterance)
  }

  if (page === 'landing') {
    return <LandingPage onNavigate={navigate} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
  }

  if (page === 'login') {
    return <Login onNavigate={navigate} />
  }

  if (page === 'register') {
    return <Register onNavigate={navigate} />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand-wrap"><Brand onClick={() => navigate('landing')} /><span className="brand-caption">AI ACCESSIBILITY</span></div>
        <div className="sidebar-section-label">MENU UTAMA</div>
        <nav className="side-nav" aria-label="Navigasi utama">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              className={`side-link ${page === id ? 'active' : ''}`}
              key={id}
              onClick={() => navigate(id)}
              type="button"
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.85} />
              <span>{label}</span>
              {page === id && <ChevronRight className="nav-chevron" size={16} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-promo">
            <span className="promo-icon"><HeartHandshake size={18} /></span>
            <strong>Komunikasi milik semua.</strong>
            <p>Bersama membangun ruang yang lebih inklusif.</p>
            <button type="button" onClick={() => navigate('about')}>Kenali BISARA <ArrowUpRight size={14} /></button>
          </div>
          <div className="sidebar-profile">
            <span className="profile-avatar">B</span>
            <span className="profile-copy"><strong>Teman BISARA</strong><small>Ruang personal</small></span>
            <span className="profile-dot" aria-label="Status aktif" />
          </div>
        </div>
      </aside>

      <div className="mobile-topbar">
        <Brand onClick={() => navigate('dashboard')} />
        <button className="icon-button mobile-menu-button" type="button" aria-label="Buka navigasi" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} /> : <span className="menu-lines" />}
        </button>
        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Navigasi utama">
            {navigation.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => navigate(id)} className={page === id ? 'active' : ''}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </nav>
        )}
      </div>

      <main className="workspace">
        <header className="workspace-top">
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{navigation.find((item) => item.id === page)?.label}</strong></div>
          <div className="header-actions">
            <span className="workspace-live"><span /> RUANG AMAN & PRIVAT</span>
            <button className="help-button" type="button" onClick={() => navigate('about')}><CircleHelp size={17} /> <span>Bantuan</span></button>
            <span className="header-avatar">B</span>
          </div>
        </header>

        <div className="page-transition" key={page}>
          {page === 'dashboard' && <Dashboard onNavigate={navigate} history={history} />}
          {page === 'sign' && (
            <SignWorkspace
              cameraOn={cameraOn}
              cameraError={cameraError}
              videoRef={videoRef}
              startCamera={startCamera}
              stopCamera={stopCamera}
              history={history}
              onSpeak={speakText}
              notice={notice}
              setNotice={setNotice}
            />
          )}
          {page === 'voice' && (
            <VoiceWorkspace
              listening={listening}
              transcript={transcript}
              voiceStatus={voiceStatus}
              clearTranscript={clearTranscript}
              startListening={startListening}
              stopListening={stopListening}
              speakText={speakText}
              copyText={copyText}
              notice={notice}
            />
          )}
          {page === 'history' && <HistoryPage history={history} onNavigate={navigate} onClear={() => setHistory([])} onCopy={copyText} notice={notice} />}
          {page === 'about' && <AboutPage onNavigate={navigate} />}
        </div>
      </main>
    </div>
  )
}

function LandingPage({ onNavigate, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Brand onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <nav className={`landing-links ${mobileMenuOpen ? 'open' : ''}`} aria-label="Navigasi halaman">
            <a href="#fitur" onClick={() => setMobileMenuOpen(false)}>Fitur</a>
            <a href="#cara-kerja" onClick={() => setMobileMenuOpen(false)}>Cara kerja</a>
            <a href="#tentang" onClick={() => setMobileMenuOpen(false)}>Tentang kami</a>
          </nav>
          <button className="button button-dark landing-signin" type="button" onClick={() => onNavigate('login')}>Masuk ke aplikasi <ArrowRight size={16} /></button>
          <button className="icon-button landing-menu-button" type="button" aria-label="Buka navigasi" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <span className="menu-lines" />}
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-glow landing-glow-one" /><div className="landing-glow landing-glow-two" />
          <div className="landing-container hero-layout">
            <div className="hero-copy">
              <span className="hero-badge"><span className="badge-spark"><Sparkles size={13} /></span> BAHASA YANG MENGHUBUNGKAN KITA</span>
              <h1>Komunikasi<br />Tanpa Batas,<br /><span>Untuk Semua.</span></h1>
              <p className="hero-description">BISARA menyatukan bahasa isyarat, suara, dan teks lewat fitur aksesibilitas digital—agar setiap percakapan terasa dekat dan dipahami.</p>
              <div className="hero-actions">
                <button className="button button-hero" type="button" onClick={() => onNavigate('login')}>Mulai Sekarang <ArrowRight size={17} /></button>
                <a className="hero-secondary-link" href="#cara-kerja"><span><ArrowDown size={16} /></span> Lihat cara kerja</a>
              </div>
              <div className="hero-trust"><span className="trust-avatars"><i /><i /><i /></span><span>Dibuat untuk percakapan yang lebih inklusif</span><ShieldCheck size={15} /></div>
            </div>
            <div className="hero-visual" aria-label="Ilustrasi komunikasi bahasa isyarat">
              <div className="hero-visual-glow" />
              <div className="visual-orbit orbit-large" /><div className="visual-orbit orbit-small" />
              <div className="visual-corner corner-tl" /><div className="visual-corner corner-br" />
              <div className="visual-interface">
                <div className="visual-interface-top"><span><i /> BISARA VISION</span><span>VISUAL PREVIEW</span></div>
                <div className="visual-hand-stage">
                  <div className="visual-halo halo-one" /><div className="visual-halo halo-two" />
                  <div className="visual-hand"><Hand size={126} strokeWidth={1.1} /></div>
                  <span className="visual-spark spark-a"><Sparkles size={17} /></span>
                  <span className="visual-spark spark-b"><Waves size={23} /></span>
                  <span className="visual-scan-line" />
                </div>
                <div className="visual-translation"><span className="translation-glyph"><MessageSquareText size={17} /></span><span><small>CONTOH HASIL TERJEMAHAN</small><strong>“Senang bertemu denganmu.”</strong></span><span className="translation-ok"><Check size={15} /></span></div>
              </div>
              <div className="visual-float visual-float-left"><span className="float-icon-purple"><AudioLines size={17} /></span><span><small>LIVE TRANSKRIPSI</small><strong>Bahasa Indonesia</strong></span></div>
              <div className="visual-float visual-float-right"><span className="float-status"><i /><i /><i /><i /><i /></span><span>Untuk komunikasi inklusif</span></div>
              <div className="visual-note"><ShieldCheck size={14} /> Privasi selalu diutamakan</div>
            </div>
          </div>
          <div className="hero-bottom">
            <span>DIRANCANG UNTUK AKSESIBILITAS</span><i /><span>BAHASA ISYARAT</span><i /><span>SUARA & TEKS</span><i /><span>UNTUK SEMUA</span>
          </div>
        </section>

        <section className="landing-intro" id="tentang">
          <div className="landing-container intro-layout">
            <div className="intro-label"><span>01</span> MISI KAMI</div>
            <div><h2>Teknologi terbaik adalah teknologi yang mendekatkan manusia.</h2><p>BISARA membuka lebih banyak cara untuk saling memahami. Dibangun dengan fokus pada aksesibilitas, privasi, dan pengalaman yang ramah untuk semua.</p></div>
            <div className="intro-stat"><strong>01</strong><span>ruang komunikasi<br />yang inklusif</span></div>
          </div>
        </section>

        <section className="feature-section" id="fitur">
          <div className="landing-container">
            <div className="section-heading"><span className="section-kicker">KOMUNIKASI DALAM BERBAGAI BENTUK</span><h2>Satu ruang. Lebih banyak cara terhubung.</h2><p>Pilih pengalaman yang paling nyaman untukmu, lalu mulai percakapan.</p></div>
            <div className="feature-grid">
              <button className="feature-card feature-sign" type="button" onClick={() => onNavigate('sign')}>
                <span className="feature-card-index">01 / VISUAL INTELLIGENCE</span><span className="feature-icon"><Hand size={24} /></span><span className="feature-arrow"><ArrowUpRight size={18} /></span>
                <strong>Isyarat ke teks</strong><span className="feature-text">Terjemahkan gerakan tangan menjadi teks dan suara. Setiap ekspresi punya ruang untuk dimengerti.</span>
                <span className="feature-bottom">Mulai berisyarat <ArrowRight size={15} /></span><span className="feature-decoration"><Hand size={150} strokeWidth={.9} /></span>
              </button>
              <button className="feature-card feature-voice" type="button" onClick={() => onNavigate('voice')}>
                <span className="feature-card-index">02 / LIVE TRANSCRIPTION</span><span className="feature-icon"><Mic size={24} /></span><span className="feature-arrow"><ArrowUpRight size={18} /></span>
                <strong>Suara ke teks</strong><span className="feature-text">Ubah percakapan menjadi tulisan secara langsung agar semua orang bisa mengikuti.</span>
                <span className="feature-bottom">Mulai mendengarkan <ArrowRight size={15} /></span><span className="feature-decoration voice-decoration"><AudioLines size={150} strokeWidth={.9} /></span>
              </button>
            </div>
          </div>
        </section>

        <section className="steps-section" id="cara-kerja">
          <div className="landing-container steps-layout">
            <div className="steps-heading"><span className="section-kicker">TIGA LANGKAH SEDERHANA</span><h2>Mulai dari cara yang terasa paling alami.</h2><p>Tanpa pengaturan yang rumit. BISARA siap menemani percakapan sehari-hari.</p><button className="text-link" type="button" onClick={() => onNavigate('dashboard')}>Jelajahi dashboard <ArrowRight size={16} /></button></div>
            <div className="steps-list">
              <div className="step-item"><span className="step-number">01</span><span className="step-icon"><Languages size={19} /></span><span><strong>Pilih cara berkomunikasi</strong><small>Gunakan kamera untuk isyarat atau mikrofon untuk suara.</small></span><ChevronRight size={17} /></div>
              <div className="step-item"><span className="step-number">02</span><span className="step-icon"><Zap size={19} /></span><span><strong>Mulai percakapan</strong><small>Berisyarat atau berbicara dengan nyaman seperti biasa.</small></span><ChevronRight size={17} /></div>
              <div className="step-item"><span className="step-number">03</span><span className="step-icon"><HeartHandshake size={19} /></span><span><strong>Saling memahami</strong><small>Lihat hasilnya dan lanjutkan percakapan tanpa batas.</small></span><ChevronRight size={17} /></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container footer-inner"><div><Brand onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} /><p>Komunikasi tanpa batas, untuk semua.</p></div><div className="footer-links"><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara kerja</a><button type="button" onClick={() => onNavigate('about')}>Tentang BISARA</button></div><span className="footer-copyright">© {new Date().getFullYear()} BISARA</span></div>
      </footer>
    </div>
  )
}

function Dashboard({ onNavigate, history }) {
  return (
    <div className="page-content dashboard-page">
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> RUANG PERSONALMU</span>
          <h1>Selamat Datang<br />di <span>BISARA.</span></h1>
          <p>Teknologi yang membantu setiap percakapan terasa lebih dekat, jelas, dan dipahami.</p>
          <button className="button button-hero welcome-cta" type="button" onClick={() => onNavigate('sign')}>Mulai percakapan <ArrowRight size={16} /></button>
        </div>
        <div className="welcome-visual" aria-hidden="true">
          <div className="welcome-orbit welcome-orbit-one" /><div className="welcome-orbit welcome-orbit-two" />
          <div className="welcome-hand"><Hand size={105} strokeWidth={1.1} /></div>
          <span className="welcome-float welcome-float-one"><Sparkles size={16} /></span>
          <span className="welcome-float welcome-float-two"><MessageSquareText size={17} /></span>
          <div className="welcome-message"><span className="message-pulse" /><span><small>RUANG TERBUKA</small><strong>Mulai ceritamu hari ini.</strong></span></div>
        </div>
        <div className="welcome-orb-decoration" />
      </section>

      <div className="dashboard-section-heading"><div><span className="section-kicker">PILIH PENGALAMAN</span><h2>Bagaimana kamu ingin berkomunikasi?</h2></div><span><ShieldCheck size={15} /> Dirancang inklusif</span></div>
      <div className="dashboard-cards">
        <button className="dashboard-card sign-card" type="button" onClick={() => onNavigate('sign')}>
          <div className="dashboard-card-top"><span className="dash-icon"><Hand size={23} /></span><span className="card-index">01</span></div>
          <span className="dash-label">VISUAL · BAHASA ISYARAT</span><strong>Isyarat ke Teks</strong><p>Terjemahkan gerakan tangan menjadi teks dan suara. Bahasa tubuhmu, kini lebih mudah dipahami.</p>
          <span className="dash-card-action">Buka penerjemah <ArrowRight size={16} /></span><span className="card-decoration"><Hand size={130} strokeWidth={.9} /></span>
        </button>
        <button className="dashboard-card voice-card" type="button" onClick={() => onNavigate('voice')}>
          <div className="dashboard-card-top"><span className="dash-icon"><Mic size={23} /></span><span className="card-index">02</span></div>
          <span className="dash-label">AUDIO · TRANSKRIPSI LANGSUNG</span><strong>Suara ke Teks</strong><p>Ubah percakapan menjadi tulisan secara langsung agar setiap orang bisa ikut terhubung.</p>
          <span className="dash-card-action">Mulai transkripsi <ArrowRight size={16} /></span><span className="card-decoration voice-decoration"><AudioLines size={132} strokeWidth={.9} /></span>
        </button>
      </div>
      <section className="dashboard-bottom">
        <div className="dashboard-activity">
          <div className="activity-heading"><div><span className="section-kicker">AKTIVITAS TERBARU</span><h2>Jejak percakapan</h2></div><button type="button" onClick={() => onNavigate('history')}>Lihat semua <ArrowRight size={14} /></button></div>
          {history.length ? history.slice(0, 3).map((item) => <HistoryRow key={item.id} item={item} />) : <div className="activity-empty"><span><History size={19} /></span><p>Belum ada aktivitas. Riwayat percakapanmu akan muncul di sini.</p></div>}
        </div>
        <div className="dashboard-aside-note"><span className="aside-note-icon"><ShieldCheck size={19} /></span><span className="section-kicker">RUANG YANG AMAN</span><strong>Privasi percakapanmu tetap terjaga.</strong><p>Gunakan izin kamera dan mikrofon hanya saat kamu siap. Kendali selalu ada di tanganmu.</p><button type="button" onClick={() => onNavigate('about')}>Tentang privasi <ArrowUpRight size={14} /></button></div>
      </section>
    </div>
  )
}

function SignWorkspace({ cameraOn, cameraError, videoRef, startCamera, stopCamera, history, notice, setNotice }) {
  const signHistory = history.filter((item) => item.kind === 'isyarat')
  return (
    <div className="page-content translator-page">
      <div className="page-heading"><div><span className="section-kicker">VISUAL AI TRANSLATOR</span><h1>Isyarat ke Teks</h1><p>Berisyarat dengan bebas. BISARA membantu membuka ruang untuk dipahami.</p></div><span className="privacy-chip"><ShieldCheck size={15} /> PRIVAT & AMAN</span></div>
      <div className="translator-layout">
        <section className="camera-column">
          <div className="camera-panel">
            <div className="camera-panel-top"><span className="camera-title"><span className={`status-dot ${cameraOn ? 'on' : ''}`} /> {cameraOn ? 'Kamera aktif' : 'Ruang kamera'}</span><span className="camera-top-meta"><span>BAHASA ISYARAT</span><CircleHelp size={16} /></span></div>
            <div className={`camera-view ${cameraOn ? 'camera-live' : ''}`}>
              {cameraOn ? <video ref={videoRef} autoPlay playsInline muted aria-label="Pratinjau kamera" /> : <div className="camera-empty"><span className="camera-empty-icon"><Camera size={28} /></span><span className="camera-grid grid-one" /><span className="camera-grid grid-two" /><strong>Kamera siap saat kamu siap.</strong><p>Posisikan diri di area terang agar gerakan tangan terlihat jelas.</p><span className="camera-tip"><Check size={14} /> Wajah dan tangan dalam bingkai</span></div>}
              {cameraOn && <><span className="camera-live-tag"><i /> KAMERA AKTIF</span><span className="camera-detection"><span className="detection-pulse" /> SIAP MENANGKAP GERAKAN</span><span className="camera-frame frame-one" /><span className="camera-frame frame-two" /></>}
              {cameraError && <p className="camera-error" role="alert">{cameraError}</p>}
            </div>
            <div className="camera-controls">
              <div className="camera-device"><span className={`device-indicator ${cameraOn ? 'active' : ''}`} /><span><strong>Kamera perangkat</strong><small>{cameraOn ? 'Aktif · hanya saat digunakan' : 'Belum terhubung'}</small></span></div>
              <button className={`button ${cameraOn ? 'button-stop' : 'button-primary'}`} type="button" onClick={cameraOn ? stopCamera : startCamera}>{cameraOn ? <><span className="stop-square" /> Matikan kamera</> : <><Camera size={16} /> Aktifkan kamera</>}</button>
            </div>
          </div>
          <div className="camera-helper"><span className="helper-icon"><ShieldCheck size={16} /></span><p><strong>Kendali tetap di tanganmu.</strong> BISARA hanya menggunakan kamera setelah kamu mengizinkannya.</p></div>
        </section>
        <section className="translation-column">
          <div className="translation-card">
            <div className="translation-card-heading"><span className="translation-icon"><Languages size={17} /></span><span><strong>Hasil terjemahan</strong><small>{cameraOn ? 'Siap untuk memulai percakapan' : 'Bahasa Indonesia · teks & suara'}</small></span><span className={`live-status ${cameraOn ? 'live' : ''}`}><i /> {cameraOn ? 'KAMERA AKTIF' : 'MENUNGGU'}</span></div>
            <div className="translation-empty"><span className="translation-empty-orbit"><span className="translation-empty-mark"><MessageSquareText size={24} /></span><i /><i /></span><strong>Terjemahanmu akan tampil di sini.</strong><p>Hasil isyarat ke teks memerlukan layanan penerjemah AI. Semua gerakanmu tetap privat.</p></div>
            <div className="translation-actions"><button className="button button-secondary" type="button" disabled><Volume2 size={16} /> Dengarkan</button><button className="button button-secondary" type="button" disabled><Copy size={15} /> Salin</button><button className="button button-quiet" type="button" onClick={() => setNotice('Belum ada teks terjemahan untuk dihapus.')}><Trash2 size={15} /> Hapus</button></div>
          </div>
          <div className="translation-note"><span><Sparkles size={16} /></span><span><strong>Penerjemah AI belum terhubung</strong><small>UI penerjemah siap. Hubungkan model AI agar gerakan dapat diterjemahkan menjadi teks.</small></span></div>
          <div className="recent-mini"><div className="recent-mini-heading"><span><History size={15} /> Riwayat isyarat</span><button type="button" onClick={() => setNotice(signHistory.length ? 'Riwayat tersedia di halaman Riwayat Terjemahan.' : 'Belum ada hasil terjemahan.')}>Lihat semua <ArrowRight size={13} /></button></div>
            {signHistory.length ? signHistory.slice(0, 3).map((item) => <HistoryRow key={item.id} item={item} compact />) : <p className="recent-empty">Hasil terjemahan akan tersimpan di sini.</p>}
          </div>
          {notice && <p className="action-notice" role="status">{notice}</p>}
        </section>
      </div>
      <div className="workspace-footnote"><span><ShieldCheck size={14} /> Privasi kamu penting bagi kami.</span><span>Bahasa Indonesia · Model AI belum terhubung</span></div>
    </div>
  )
}

function VoiceWorkspace({ listening, transcript, voiceStatus, clearTranscript, startListening, stopListening, speakText, copyText, notice }) {
  const statusLabel = voiceStatus === 'listening' ? 'SEDANG MENDENGARKAN' : voiceStatus === 'done' ? 'TRANSKRIPSI SELESAI' : voiceStatus === 'error' ? 'PERLU PERHATIAN' : 'SIAP MENDENGARKAN'
  return (
    <div className="page-content voice-page">
      <div className="page-heading"><div><span className="section-kicker">LIVE SPEECH TRANSCRIPTION</span><h1>Suara ke Teks</h1><p>Dengarkan percakapan dengan jelas, satu kata pada satu waktu.</p></div><span className="privacy-chip"><ShieldCheck size={15} /> PRIVAT & AMAN</span></div>
      <div className="voice-layout">
        <section className="voice-console">
          <div className="voice-console-header"><div><span className="console-icon"><AudioLines size={17} /></span><span><strong>Studio transkripsi</strong><small>Bahasa Indonesia · Web Speech API</small></span></div><span className={`listening-status ${listening ? 'is-listening' : ''} ${voiceStatus === 'done' ? 'is-done' : ''}`}><i /> {statusLabel}</span></div>
          <div className={`wave-stage ${listening ? 'wave-active' : ''}`}>
            <span className="wave-stage-ring ring-one" /><span className="wave-stage-ring ring-two" />
            <span className="mic-orbit orbit-a" /><span className="mic-orbit orbit-b" />
            <button className={`mic-button ${listening ? 'listening' : ''}`} type="button" onClick={listening ? stopListening : startListening} aria-label={listening ? 'Berhenti mendengarkan' : 'Mulai mendengarkan'}>{listening ? <span className="mic-stop" /> : <Mic size={27} />}</button>
            <div className="wave-bars" aria-hidden="true">{waveBars.map((height, index) => <i key={index} style={{ '--bar-height': `${height}px`, '--bar-delay': `${(index % 12) * -0.09}s` }} />)}</div>
            <div className="wave-stage-caption"><span className="mic-hint">{listening ? 'BISARA sedang mendengarkan...' : voiceStatus === 'done' ? 'Kamu bisa mulai sesi baru kapan saja.' : 'Tekan mikrofon untuk memulai'}</span><span className="wave-locale"><span /> id-ID</span></div>
          </div>
          <div className="voice-console-controls"><button className={`button ${listening ? 'button-stop' : 'button-primary'}`} type="button" onClick={listening ? stopListening : startListening}>{listening ? <><span className="stop-square" /> Berhenti mendengarkan</> : <><Mic size={16} /> Mulai mendengarkan</>}</button><span><ShieldCheck size={14} /> Mikrofon hanya aktif saat sesi berjalan</span></div>
          <div className="voice-tips"><span><Sparkles size={16} /></span><p><strong>Untuk hasil yang lebih akurat</strong><small>Ucapkan dengan jelas dan kurangi suara latar di sekitarmu.</small></p></div>
        </section>

        <section className="transcript-panel">
          <div className="transcript-panel-header"><div><span className="transcript-panel-icon"><MessageSquareText size={17} /></span><span><strong>Hasil transkripsi</strong><small>Transkrip langsung dari percakapanmu</small></span></div><span className={`transcript-state state-${voiceStatus}`}><i /> {voiceStatus === 'done' ? 'SELESAI' : listening ? 'LIVE' : voiceStatus === 'error' ? 'PERIKSA' : 'KOSONG'}</span></div>
          <div className={`transcript-content ${transcript ? 'has-transcript' : ''}`} aria-live="polite">
            {transcript ? <p>{transcript}{listening && <span className="transcript-cursor" aria-hidden="true" />}</p> : <div className="transcript-placeholder"><span className="transcript-placeholder-art"><span><MessageSquareText size={25} /></span><i /><i /><i /></span><strong>Ruang kata-katamu.</strong><span>Mulai sesi untuk menampilkan transkripsi langsung di sini.</span></div>}
          </div>
          <div className="transcript-panel-footer"><span className="transcript-language"><span /> Bahasa Indonesia</span><div className="transcript-actions"><button className="button button-quiet" type="button" onClick={() => copyText(transcript)} disabled={!transcript}><Copy size={15} /> Salin</button><button className="button button-quiet danger-quiet" type="button" onClick={clearTranscript} disabled={!transcript}><Trash2 size={15} /> Hapus hasil</button></div></div>
          {transcript && voiceStatus === 'done' && <button className="listen-result" type="button" onClick={() => speakText(transcript)}><Volume2 size={15} /> Dengarkan hasilnya <ArrowRight size={14} /></button>}
          {notice && <p className="action-notice transcript-notice" role="status">{notice}</p>}
        </section>
      </div>
      <div className="workspace-footnote"><span><ShieldCheck size={14} /> Transkripsi diproses oleh browser kamu.</span><span>Web Speech API · <button type="button" onClick={() => speakText('Transkripsi bahasa Indonesia')}>Text-to-Speech <Volume2 size={13} /></button></span></div>
    </div>
  )
}

function HistoryRow({ item, compact = false }) {
  return (
    <div className={`history-row ${compact ? 'compact' : ''}`}>
      <span className={`history-type ${item.kind}`}><MessageSquareText size={16} /></span>
      <span className="history-text"><strong>{item.text}</strong><small>{item.kind === 'suara' ? 'Suara ke teks' : 'Isyarat ke teks'}</small></span>
      <span className="history-time"><Clock3 size={13} /> {item.time}</span>
    </div>
  )
}

function HistoryPage({ history, onNavigate, onClear, onCopy, notice }) {
  return (
    <div className="page-content history-page">
      <div className="page-heading"><div><span className="section-kicker">SEMUA PERCAKAPANMU</span><h1>Riwayat Terjemahan</h1><p>Temukan kembali kata-kata yang pernah dibagikan di BISARA.</p></div><span className="history-total">{history.length} percakapan</span></div>
      <section className="history-surface">
        <div className="history-page-toolbar"><div><span className="history-toolbar-mark"><History size={18} /></span><span><strong>Aktivitas terbaru</strong><small>Tersimpan di sesi browser ini</small></span></div>{history.length > 0 && <button className="button button-quiet danger-quiet" type="button" onClick={onClear}><Trash2 size={15} /> Hapus semua</button>}</div>
        {history.length ? <div className="history-page-list">{history.map((item) => <div className="history-page-item" key={item.id}><HistoryRow item={item} /><button className="icon-button history-copy" type="button" aria-label="Salin percakapan" onClick={() => onCopy(item.text)}><Copy size={15} /></button></div>)}</div> : <div className="history-page-empty"><span className="history-empty-art"><History size={28} /><i /><i /></span><strong>Riwayatmu dimulai dari sini.</strong><p>Hasil transkripsi suara yang selesai akan tersimpan di halaman ini.</p><button className="button button-primary" type="button" onClick={() => onNavigate('voice')}>Mulai transkripsi <ArrowRight size={15} /></button></div>}
      </section>
      {notice && <p className="action-notice" role="status">{notice}</p>}
    </div>
  )
}

function AboutPage({ onNavigate }) {
  return (
    <div className="page-content about-page">
      <div className="about-hero">
        <span className="about-mark"><Hand size={30} /></span><span className="section-kicker">TENTANG BISARA</span>
        <h1>Lebih dari teknologi.<br /><span>Sebuah jembatan.</span></h1>
        <p>BISARA hadir untuk mendekatkan orang melalui berbagai cara berkomunikasi. Karena setiap gerakan punya arti dan setiap suara layak didengar.</p>
        <div className="about-orbit"><span /><span /><span /></div>
      </div>
      <div className="about-pillars">
        <div><span><HeartHandshake size={20} /></span><strong>Inklusif sejak awal</strong><p>Pengalaman dirancang agar mudah diakses dan nyaman untuk beragam cara berkomunikasi.</p></div>
        <div><span><ShieldCheck size={20} /></span><strong>Privasi yang utama</strong><p>Kamera dan mikrofon hanya digunakan saat kamu mengaktifkannya.</p></div>
        <div><span><Zap size={20} /></span><strong>Teknologi bermakna</strong><p>AI membantu memberi lebih banyak ruang untuk memahami satu sama lain.</p></div>
      </div>
      <div className="about-cta"><span><Headphones size={20} /></span><div><strong>Siap memulai percakapan?</strong><small>Pilih pengalaman yang paling nyaman untukmu.</small></div><button className="button button-primary" type="button" onClick={() => onNavigate('dashboard')}>Ke dashboard <ArrowRight size={15} /></button></div>
    </div>
  )
}

export default App
