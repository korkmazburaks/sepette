import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const STRIP_A = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=220&q=75', // pizza
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=220&q=75', // burger
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=220&q=75', // food spread
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=220&q=75', // avocado toast
  'https://images.unsplash.com/photo-1476224203421-74177f36d8e2?w=220&q=75', // steak
  'https://images.unsplash.com/photo-1484723045756-b1ae7b5ae3ae?w=220&q=75', // pasta
]
const STRIP_B = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=220&q=75', // restaurant
  'https://images.unsplash.com/photo-1551782519-6d9a154f3e28?w=220&q=75', // ramen
  'https://images.unsplash.com/photo-1496116218422-d673efda7b5e?w=220&q=75', // salad
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=220&q=75', // tacos
  'https://images.unsplash.com/photo-1559181567-c3190592588a?w=220&q=75', // donuts
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=220&q=75', // curry
]
const STRIP_C = [
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=220&q=75', // pizza 2
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=220&q=75', // salad 2
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=220&q=75', // restaurant 2
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=220&q=75', // cake
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=220&q=75', // sushi
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=220&q=75', // burger 2
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

export function isIntroSeen() { return false }

export function IntroModal({ onDone, de }: { onDone: () => void; de: boolean }) {
  const { signInWithGoogle } = useAuth()

  async function handleGoogle() {
    await signInWithGoogle()
    onDone()
  }

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
        </div>
        <div className="absolute inset-0 bg-ink/50" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 w-full max-w-mobile px-6 flex flex-col items-center gap-3">
        {/* Brand */}
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

        {/* Buttons */}
        <motion.div
          className="w-full space-y-2.5"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.2, type: 'spring', damping: 24 } }}
        >
          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white font-semibold text-sm text-ink active:scale-[0.98] transition-all"
          >
            <GoogleIcon />
            {de ? 'Mit Google anmelden' : 'Continue with Google'}
          </button>

          {/* Apple */}
          <button
            onClick={onDone}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-black border border-white/20 font-semibold text-sm text-white active:scale-[0.98] transition-all"
          >
            <AppleIcon />
            {de ? 'Mit Apple anmelden' : 'Continue with Apple'}
          </button>

          {/* Email */}
          <button
            onClick={onDone}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 font-semibold text-sm text-white active:scale-[0.98] transition-all"
          >
            <Mail className="w-4 h-4" />
            {de ? 'Mit E-Mail anmelden' : 'Continue with email'}
          </button>

          {/* Skip */}
          <button
            onClick={onDone}
            className="w-full flex items-center justify-center py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 font-semibold text-sm text-white/80 active:scale-[0.98] transition-all"
          >
            {de ? 'Ohne Konto fortfahren' : 'Continue without account'}
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}