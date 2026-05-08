import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { MobileShell } from '@/components/layout/MobileShell'
import { BottomNav } from '@/components/layout/BottomNav'
import { CartFAB } from '@/components/cart/CartFAB'
import { CartSheet } from '@/components/cart/CartSheet'
import { LiveOrderBanner } from '@/components/ui/LiveOrderBanner'
import { Home } from '@/pages/Home'
import { Restaurant } from '@/pages/Restaurant'
import { Orders } from '@/pages/Orders'
import { Profile } from '@/pages/Profile'
import { useThemeStore } from '@/store/themeStore'
import { IntroModal } from '@/components/ui/IntroModal'
import { ProfileCompleteModal } from '@/components/ui/ProfileCompleteModal'
import { useLangStore } from '@/store/langStore'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

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
  const { user } = useAuth()
  const { profile, loading: profileLoading, updateProfile } = useProfile(user)
  const [showIntro, setShowIntro] = useState(false)
  const [skipProfileComplete, setSkipProfileComplete] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(true), 400)
    return () => clearTimeout(t)
  }, [])

  const showProfileComplete =
    !showIntro &&
    !skipProfileComplete &&
    !!user &&
    !profileLoading &&
    profile !== null &&
    !profile.phone

  return (
    <BrowserRouter>
      <MobileShell>
        <AnimatedRoutes />
        <BottomNav />
        <CartFAB />
        <CartSheet />
        <LiveOrderBanner />
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

      {showProfileComplete && (
        <ProfileCompleteModal
          profile={profile}
          onSave={async (data) => {
            await updateProfile(data)
            setSkipProfileComplete(true)
          }}
          onSkip={() => setSkipProfileComplete(true)}
        />
      )}
    </BrowserRouter>
  )
}