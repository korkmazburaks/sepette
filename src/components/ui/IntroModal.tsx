import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const STRIP_A = [
  '/food/1.jpg','/food/2.jpg','/food/3.jpg','/food/4.jpg','/food/6.jpg',
  '/food/7.jpg','/food/8.jpg','/food/9.jpg','/food/11.jpg','/food/12.jpg','/food/14.jpg',
]
const STRIP_B = [
  '/food/15.jpg','/food/16.jpg','/food/17.jpg','/food/18.jpg','/food/19.jpg',
  '/food/22.jpg','/food/23.jpg','/food/24.jpg','/food/25.jpg','/food/28.jpg','/food/29.jpg',
]
const STRIP_C = [
  '/food/30.jpg','/food/31.jpg','/food/32.jpg','/food/33.jpg','/food/34.jpg',
  '/food/35.jpg','/food/36.jpg','/food/37.jpg','/food/38.jpg','/food/39.jpg','/food/40.jpg',
]

function PhotoStrip({ photos, direction, speed = 28 }: {
  photos: string[]
  direction: 'left' | 'right'
  speed?: number
}) {
  const doubled = [...photos, ...photos, ...photos]
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const totalW = el.scrollWidth / 2
    if (totalW === 0) return
    let pos = direction === 'right' ? -totalW : 0
    let raf: number
    let running = true

    function step() {
      if (!running || !el) return
      if (direction === 'left') {
        pos -= speed / 60
        if (pos <= -totalW) pos = 0
      } else {
        pos += speed / 60
        if (pos >= 0) pos = -totalW
      }
      el.style.transform = `translateX(${pos}px)`
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => { running = false; cancelAnimationFrame(raf) }
  }, [direction, speed])

  return (
    <div className="overflow-hidden w-full">
      <div ref={ref} className="flex gap-2 will-change-transform">
        {doubled.map((src, i) => (
          <img
            key={i} src={src} alt="" draggable={false}
            className="h-24 w-36 object-cover rounded-2xl flex-none select-none bg-stone-800"
            loading="eager"
          />
        ))}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-none fill-white" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

/* ── Email auth panel ──────────────────────────────────────── */
function EmailPanel({ de, onBack, onDone }: { de: boolean; onBack: () => void; onDone: () => void }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode]         = useState<'login' | 'signup'>('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (mode === 'signup' && !name.trim()) {
      setError(de ? 'Bitte Namen eingeben' : 'Please enter your name')
      return
    }
    setLoading(true)
    if (mode === 'login') {
      const err = await signIn(email, password)
      if (err) { setError(err.message); setLoading(false); return }
      onDone()
    } else {
      const err = await signUp(email, password, name.trim())
      if (err) { setError(err.message); setLoading(false); return }
      setDone(true)
      setTimeout(onDone, 2200)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-7 h-7 text-green-400" />
        </div>
        <p className="font-bold text-white text-lg">
          {de ? 'Bestätigungs-E-Mail gesendet!' : 'Confirmation email sent!'}
        </p>
        <p className="text-sm text-white/70 px-4">
          {de ? `Bitte bestätige: ${email}` : `Please confirm: ${email}`}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h2 className="font-bold text-white text-base">
          {mode === 'login' ? (de ? 'Anmelden' : 'Sign in') : (de ? 'Konto erstellen' : 'Create account')}
        </h2>
      </div>

      <div className="flex p-1 bg-white/10 rounded-xl mb-4">
        {(['login', 'signup'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m ? 'bg-white text-ink' : 'text-white/70'
            }`}
          >
            {m === 'login' ? (de ? 'Anmelden' : 'Sign in') : (de ? 'Registrieren' : 'Register')}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && (
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder={de ? 'Vollständiger Name' : 'Full name'}
            required
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/60 transition-colors"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          placeholder={de ? 'E-Mail-Adresse' : 'Email address'}
          required
          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/60 transition-colors"
        />
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder={de ? 'Passwort (mind. 6 Zeichen)' : 'Password (min. 6 chars)'}
            required
            minLength={6}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/60 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && <p className="text-red-300 text-xs px-1">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-wolt-base font-semibold text-sm text-white active:scale-[0.98] disabled:opacity-60 transition-all"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : (mode === 'login'
                ? (de ? 'Anmelden' : 'Sign in')
                : (de ? 'Konto erstellen' : 'Create account'))
          }
        </button>
      </form>
    </div>
  )
}

export function isIntroSeen() { return false }

export function IntroModal({ onDone, de }: { onDone: () => void; de: boolean }) {
  const { signInWithGoogle, signInWithApple } = useAuth()
  const [showEmail, setShowEmail] = useState(false)

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      {/* Photo background */}
      <div className="absolute inset-0 bg-ink overflow-hidden">
        <div className="flex flex-col gap-2 pt-4 opacity-55">
          <PhotoStrip photos={STRIP_A} direction="left"  speed={30} />
          <PhotoStrip photos={STRIP_B} direction="right" speed={22} />
          <PhotoStrip photos={STRIP_C} direction="left"  speed={26} />
          <PhotoStrip photos={STRIP_A} direction="right" speed={20} />
          <PhotoStrip photos={STRIP_B} direction="left"  speed={28} />
          <PhotoStrip photos={STRIP_C} direction="right" speed={24} />
          <PhotoStrip photos={STRIP_A} direction="left"  speed={32} />
        </div>
        <div className="absolute inset-0 bg-ink/50" />
      </div>

      <div className="relative z-10 w-full max-w-mobile px-6 flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          {showEmail ? (
            <motion.div
              key="email"
              className="w-full"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            >
              <EmailPanel de={de} onBack={() => setShowEmail(false)} onDone={onDone} />
            </motion.div>
          ) : (
            <motion.div
              key="main"
              className="w-full flex flex-col items-center gap-3"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            >
              <motion.div
                className="text-center mb-2"
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.1, type: 'spring', damping: 24 } }}
              >
                <h1 className="text-3xl font-black text-white tracking-tight">Sepette</h1>
                <p className="text-base font-semibold text-white mt-1" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                  {de ? 'Essen. Einfach.' : 'Food. Simple.'}
                </p>
              </motion.div>

              <motion.div
                className="w-full space-y-2.5"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.2, type: 'spring', damping: 24 } }}
              >
                <button
                  onClick={() => signInWithGoogle().then(onDone)}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white font-semibold text-sm text-ink active:scale-[0.98] transition-all"
                >
                  <GoogleIcon />
                  {de ? 'Mit Google anmelden' : 'Continue with Google'}
                </button>

                <button
                  onClick={() => signInWithApple().then(onDone)}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-black border border-white/20 font-semibold text-sm text-white active:scale-[0.98] transition-all"
                >
                  <AppleIcon />
                  {de ? 'Mit Apple anmelden' : 'Continue with Apple'}
                </button>

                <button
                  onClick={() => setShowEmail(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 font-semibold text-sm text-white active:scale-[0.98] transition-all"
                >
                  <Mail className="w-4 h-4" />
                  {de ? 'Mit E-Mail anmelden' : 'Continue with email'}
                </button>

                <button
                  onClick={onDone}
                  className="w-full flex items-center justify-center py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 font-semibold text-sm text-white/80 active:scale-[0.98] transition-all"
                >
                  {de ? 'Ohne Konto fortfahren' : 'Continue without account'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
