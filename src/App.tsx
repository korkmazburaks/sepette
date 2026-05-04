import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { MobileShell } from '@/components/layout/MobileShell'
import { BottomNav } from '@/components/layout/BottomNav'
import { CartFAB } from '@/components/cart/CartFAB'
import { CartSheet } from '@/components/cart/CartSheet'
import { Home } from '@/pages/Home'
import { Restaurant } from '@/pages/Restaurant'
import { Orders } from '@/pages/Orders'
import { Profile } from '@/pages/Profile'
import { useThemeStore } from '@/store/themeStore'
import { IntroModal, isIntroSeen } from '@/components/ui/IntroModal'
import { useLangStore } from '@/store/langStore'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                 element={<Home />} />
        <Route path="/restaurant/:slug" element={<Restaurant />} />
        <Route path="/orders"           element={<Orders />} />
        <Route path="/profile"          element={<Profile />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (!isIntroSeen()) {
      // Slight delay so the app renders first
      const t = setTimeout(() => setShowIntro(true), 400)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <BrowserRouter>
      <MobileShell>
        <AnimatedRoutes />
        <BottomNav />
        <CartFAB />
        <CartSheet />
      </MobileShell>

      <AnimatePresence>
        {showIntro && (
          <IntroModal
            key="intro"
            de={lang === 'de'}
            onDone={() => setShowIntro(false)}
          />
        )}
      </AnimatePresence>
    </BrowserRouter>
  )
}