import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, Mail, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLocationStore } from '@/store/locationStore'

/* ── Food photo strips ─────────────────────────────────────────────────────── */
const STRIP_A = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=220&q=75', // pizza
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=220&q=75', // burger
  'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=220&q=75', // sushi
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=220&q=75', // pasta
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=220&q=75', // curry
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=220&q=75', // salad
]
const STRIP_B = [
  'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=220&q=75', // kebab
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=220&q=75', // ramen
  'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=220&q=75', // steak
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=220&q=75', // cake
  'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=220&q=75', // chicken
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=220&q=75', // tacos
]
const STRIP_C = [
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=220&q=75', // pizza 2
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=220&q=75', // sushi 2
  'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=220&q=75', // pasta 2
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=220&q=75', // egg
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=220&q=75', // food
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=220&q=75', // fish
]

function PhotoStrip({ photos, direction, speed = 28 }: {
  photos: string[]
  direction: 'left' | 'right'
  speed?: number
}) {
  const doubled = [...photos, ...photos]
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const totalW = el.scrollWidth / 2
    let pos = direction === 'right' ? -totalW : 0
    let raf: number

    function step() {
      if (!el) return
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
    return () => cancelAnimationFrame(raf)
  }, [direction, speed])

  return (
    <div className="overflow-hidden">
      <div ref={ref} className="flex gap-2 will-change-transform">
        {doubled.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            draggable={false}
            className="h-24 w-36 object-cover rounded-2xl flex-none select-none"
            loading="eager"
          />
        ))}
      </div>
    </div>
  )
}

/* ── Google icon ───────────────────────────────────────────────────────────── */
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

/* ── Constants ─────────────────────────────────────────────────────────────── */
const INTRO_KEY = 'sepette_intro_done'
export function isIntroSeen() { return localStorage.getItem(INTRO_KEY) === '1' }

/* ── IntroModal ────────────────────────────────────────────────────────────── */
export function IntroModal({ onDone, de }: { onDone: () => void; de: boolean }) {
  const { signInWithGoogle } = useAuth()
  const { request, status } = useLocationStore()

  function dismiss() {
    localStorage.setItem(INTRO_KEY, '1')
    onDone()
  }

  function handleGps() {
    request()
  }

  async function handleGoogle() {
    await signInWithGoogle()
    dismiss()
  }

  const gpsGranted  = status === 'granted'
  const gpsDenied   = status === 'denied'
  const gpsLoading  = status === 'loading'

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      {/* ── Photo background ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-ink overflow-hidden">
        <div className="flex flex-col gap-2 pt-6 opacity-60">
          <PhotoStrip photos={STRIP_A} direction="left"  speed={30} />
          <PhotoStrip photos={STRIP_B} direction="right" speed={22} />
          <PhotoStrip photos={STRIP_C} direction="left"  speed={26} />
          <PhotoStrip photos={STRIP_A} direction="right" speed={20} />
          <PhotoStrip photos={STRIP_B} direction="left"  speed={28} />
        </div>
        {/* Gradient overlay — heavy at top & bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/20 to-ink/95" />
      </div>

      {/* ── Close button ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex justify-end p-4 pt-safe">
        <button
          onClick={dismiss}
          className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ── Spacer ───────────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Bottom card ──────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-mobile mx-auto">
        <motion.div
          className="bg-canvas rounded-t-[2.5rem] px-5 pt-6 pb-safe"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.15, type: 'spring', damping: 28, stiffness: 280 } }}
        >
          {/* Branding */}
          <div className="text-center mb-6">
            <p className="text-3xl mb-2">🛵</p>
            <h1 className="text-2xl font-bold text-ink leading-tight">
              {de ? 'Essen. Einfach.' : 'Food. Simple.'}
            </h1>
            <p className="text-sm text-fog mt-1">
              {de
                ? 'Restaurants in deiner Nähe entdecken'
                : 'Discover restaurants near you'}
            </p>
          </div>

          <div className="space-y-3">
            {/* GPS */}
            <button
              onClick={handleGps}
              disabled={gpsGranted || gpsLoading}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] ${
                gpsGranted
                  ? 'bg-emerald/10 text-emerald'
                  : gpsDenied
                    ? 'bg-coral/10 text-coral'
                    : 'bg-wolt-light text-wolt-base'
              }`}
            >
              {gpsLoading  ? <Loader2 className="w-4 h-4 animate-spin" /> :
               gpsGranted  ? <CheckCircle className="w-4 h-4" /> :
                             <MapPin className="w-4 h-4" />}
              {gpsGranted  ? (de ? 'Standort aktiviert ✓' : 'Location enabled ✓') :
               gpsLoading  ? (de ? 'Wird ermittelt…' : 'Locating…') :
               gpsDenied   ? (de ? 'Zugriff verweigert' : 'Permission denied') :
                             (de ? 'Meinen Standort verwenden' : 'Use my location')}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-cloud" />
              <span className="text-[11px] text-fog font-medium">
                {de ? 'oder anmelden' : 'or continue with'}
              </span>
              <div className="flex-1 h-px bg-cloud" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-cloud bg-canvas font-semibold text-sm text-ink active:scale-[0.98] transition-all"
            >
              <GoogleIcon />
              {de ? 'Mit Google anmelden' : 'Continue with Google'}
            </button>

            {/* Email */}
            <button
              onClick={dismiss}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-mist font-semibold text-sm text-ink active:scale-[0.98] transition-all"
            >
              <Mail className="w-4 h-4 text-fog" />
              {de ? 'Mit E-Mail anmelden' : 'Continue with email'}
            </button>

            {/* Skip */}
            <button
              onClick={dismiss}
              className="w-full py-2 text-xs text-fog text-center"
            >
              {de ? 'Ohne Konto fortfahren' : 'Continue without account'}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}