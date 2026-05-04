import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Globe, Bell, Shield, Info, LogOut,
  X, Check, Moon, Sun, Mail, Lock,
  User as UserIcon, Eye, EyeOff, ClipboardList, ChevronRight, RefreshCw, Camera,
  Image as ImageIcon,
} from 'lucide-react'
import { useLangStore } from '@/store/langStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useThemeStore } from '@/store/themeStore'
import { useAuth } from '@/hooks/useAuth'
import { LangToggle } from '@/components/ui/LangToggle'
import { AddressModal } from '@/components/ui/AddressModal'

/* ─── variants ──────────────────────────────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 26, stiffness: 300 } },
  exit:    { opacity: 0, y: 12, transition: { duration: 0.15 } },
}
const sheetVariants = {
  hidden:  { y: '100%' },
  visible: { y: 0, transition: { type: 'spring' as const, damping: 30, stiffness: 320 } },
  exit:    { y: '100%', transition: { duration: 0.2 } },
}

type Sheet = 'address' | 'privacy' | 'about' | 'signin' | 'signup' | 'password' | 'avatarpicker' | 'photooptions' | null

const PRESET_AVATARS = [
  '🐣','🐥','🦕','🦖','🐘','🐼','🐨','🦊',
  '🐰','🐶','🐱','🦄','🐸','🦋','🐧','🦔',
  '🐬','🦭','🐢','🐿️','🦝','🦙','🐾','🌸',
]

/* ─── primitives ────────────────────────────────────────────────────────────── */
function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-40"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    />
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full flex-none transition-colors duration-200 ${on ? 'bg-wolt-base' : 'bg-cloud'}`}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      />
    </button>
  )
}

function SheetWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-mobile pointer-events-auto">
        <motion.div
          variants={sheetVariants} initial="hidden" animate="visible" exit="exit"
          className="bg-canvas rounded-t-3xl shadow-2xl px-4 pt-4 pb-safe max-h-[88dvh] overflow-y-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}

function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <button onClick={onClose} className="w-8 h-8 rounded-full bg-mist flex items-center justify-center">
        <X className="w-4 h-4 text-fog" />
      </button>
    </div>
  )
}

function SettingRow({
  icon: Icon, label, value, action, border = true,
}: { icon: React.ElementType; label: string; value?: string; action?: () => void; border?: boolean }) {
  const cls = `w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${action ? 'hover:bg-mist cursor-pointer' : ''} ${border ? 'border-b border-cloud' : ''}`
  return action
    ? (
      <button onClick={action} className={cls}>
        <div className="w-8 h-8 bg-wolt-light rounded-xl flex items-center justify-center flex-none">
          <Icon className="w-4 h-4 text-wolt-base" />
        </div>
        <span className="flex-1 text-sm font-medium text-ink">{label}</span>
        {value && <span className="text-xs text-fog">{value}</span>}
        <ChevronRight className="w-4 h-4 text-cloud flex-none" />
      </button>
    )
    : (
      <div className={cls}>
        <div className="w-8 h-8 bg-wolt-light rounded-xl flex items-center justify-center flex-none">
          <Icon className="w-4 h-4 text-wolt-base" />
        </div>
        <span className="flex-1 text-sm font-medium text-ink">{label}</span>
        {value && <span className="text-xs text-fog">{value}</span>}
      </div>
    )
}

function ToggleRow({ icon: Icon, label, on, onToggle, border = true }: {
  icon: React.ElementType; label: string; on: boolean; onToggle: () => void; border?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${border ? 'border-b border-cloud' : ''}`}>
      <div className="w-8 h-8 bg-wolt-light rounded-xl flex items-center justify-center flex-none">
        <Icon className="w-4 h-4 text-wolt-base" />
      </div>
      <span className="flex-1 text-sm font-medium text-ink">{label}</span>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

/* ─── OAuth Buttons ─────────────────────────────────────────────────────────── */
function OAuthButtons({ de, onGoogle, onApple }: {
  de: boolean
  onGoogle: () => void
  onApple: () => void
}) {
  return (
    <>
      <div className="relative flex items-center my-4">
        <div className="flex-1 h-px bg-cloud" />
        <span className="px-3 text-xs text-fog">{de ? 'oder weiter mit' : 'or continue with'}</span>
        <div className="flex-1 h-px bg-cloud" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={onGoogle}
          className="flex items-center justify-center gap-2 border border-cloud bg-canvas rounded-2xl py-3 text-sm font-medium text-ink active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-none">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
        <button
          onClick={onApple}
          className="flex items-center justify-center gap-2 bg-ink text-canvas rounded-2xl py-3 text-sm font-medium active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-none fill-current">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </button>
      </div>
    </>
  )
}

/* ─── Email Pending Screen ──────────────────────────────────────────────────── */
function EmailPendingSheet({ email, onClose, de }: { email: string; onClose: () => void; de: boolean }) {
  return (
    <>
      <Backdrop onClose={onClose} />
      <SheetWrap>
        <SheetHeader title={de ? 'E-Mail bestätigen' : 'Confirm Email'} onClose={onClose} />
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-20 h-20 rounded-3xl bg-wolt-light flex items-center justify-center text-4xl">
            📧
          </div>
          <p className="text-base font-bold text-ink text-center">
            {de ? 'Bestätigungs-E-Mail gesendet!' : 'Confirmation email sent!'}
          </p>
          <p className="text-sm text-fog text-center leading-relaxed">
            {de ? (
              <>Wir haben eine E-Mail an <span className="font-semibold text-ink">{email}</span> geschickt. Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.</>
            ) : (
              <>We sent an email to <span className="font-semibold text-ink">{email}</span>. Click the link in the email to activate your account.</>
            )}
          </p>
          <div className="w-full bg-mist rounded-2xl p-3 flex items-start gap-2">
            <span className="text-base">💡</span>
            <p className="text-xs text-fog leading-relaxed">
              {de
                ? 'E-Mail nicht erhalten? Prüfe deinen Spam-Ordner oder versuche es erneut.'
                : "Didn't receive it? Check your spam folder or try again."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-wolt-base text-white font-semibold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-transform"
          >
            OK
          </button>
        </div>
      </SheetWrap>
    </>
  )
}

/* ─── Sign In Sheet ─────────────────────────────────────────────────────────── */
function SignInSheet({ onClose, onSwitchSignUp, de, signIn, signInWithGoogle, signInWithApple }: {
  onClose: () => void; onSwitchSignUp: () => void; de: boolean
  signIn: (e: string, p: string) => Promise<import('@supabase/supabase-js').AuthError | null>
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !password) { setError(de ? 'Bitte alle Felder ausfüllen.' : 'Fill in all fields.'); return }
    setLoading(true)
    const err = await signIn(email.trim(), password)
    setLoading(false)
    if (err) {
      setError(de ? 'E-Mail oder Passwort falsch.' : 'Incorrect email or password.')
    } else {
      onClose()
    }
  }

  return (
    <>
      <Backdrop onClose={onClose} />
      <SheetWrap>
        <SheetHeader title={de ? 'Anmelden' : 'Sign In'} onClose={onClose} />
        <div className="flex flex-col items-center gap-1 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-wolt-light flex items-center justify-center">
            <UserIcon className="w-7 h-7 text-wolt-base" />
          </div>
          <p className="text-sm text-fog text-center mt-1">
            {de ? 'Willkommen bei Sepette!' : 'Welcome to Sepette!'}
          </p>
        </div>

        <OAuthButtons
          de={de}
          onGoogle={() => { signInWithGoogle(); onClose() }}
          onApple={() => { signInWithApple(); onClose() }}
        />

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 bg-mist rounded-2xl px-4 py-3">
            <Mail className="w-4 h-4 text-fog flex-none" />
            <input type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder={de ? 'E-Mail-Adresse' : 'Email address'}
              className="flex-1 bg-transparent text-sm text-ink placeholder-fog outline-none" />
          </div>
          <div className="flex items-center gap-3 bg-mist rounded-2xl px-4 py-3">
            <Lock className="w-4 h-4 text-fog flex-none" />
            <input type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={de ? 'Passwort' : 'Password'}
              className="flex-1 bg-transparent text-sm text-ink placeholder-fog outline-none" />
            <button onClick={() => setShowPw((p) => !p)} className="text-fog flex-none">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-coral mb-3 px-1">{error}</p>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-wolt-base text-white font-semibold py-3.5 rounded-2xl text-sm mb-3 active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {de ? 'Anmelden' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-fog">
          {de ? 'Noch kein Konto? ' : 'No account? '}
          <button onClick={onSwitchSignUp} className="text-wolt-base font-semibold">
            {de ? 'Registrieren' : 'Sign up'}
          </button>
        </p>
      </SheetWrap>
    </>
  )
}

/* ─── Sign Up Sheet ─────────────────────────────────────────────────────────── */
function SignUpSheet({ onClose, onSwitchSignIn, de, signUp, signInWithGoogle, signInWithApple }: {
  onClose: () => void; onSwitchSignIn: () => void; de: boolean
  signUp: (email: string, password: string, name: string) => Promise<import('@supabase/supabase-js').AuthError | null>
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) { setError(de ? 'Bitte alle Felder ausfüllen.' : 'Fill in all fields.'); return }
    if (!email.includes('@')) { setError(de ? 'Ungültige E-Mail.' : 'Invalid email.'); return }
    if (password.length < 6) { setError(de ? 'Passwort mind. 6 Zeichen.' : 'Password min. 6 chars.'); return }
    setLoading(true)
    const err = await signUp(email.trim(), password, name.trim())
    setLoading(false)
    if (err) setError(err.message)
    else onClose()
  }

  return (
    <>
      <Backdrop onClose={onClose} />
      <SheetWrap>
        <SheetHeader title={de ? 'Konto erstellen' : 'Create Account'} onClose={onClose} />

        <OAuthButtons
          de={de}
          onGoogle={() => { signInWithGoogle(); onClose() }}
          onApple={() => { signInWithApple(); onClose() }}
        />

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 bg-mist rounded-2xl px-4 py-3">
            <UserIcon className="w-4 h-4 text-fog flex-none" />
            <input value={name} onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder={de ? 'Vollständiger Name' : 'Full name'}
              className="flex-1 bg-transparent text-sm text-ink placeholder-fog outline-none" />
          </div>
          <div className="flex items-center gap-3 bg-mist rounded-2xl px-4 py-3">
            <Mail className="w-4 h-4 text-fog flex-none" />
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder={de ? 'E-Mail-Adresse' : 'Email address'}
              className="flex-1 bg-transparent text-sm text-ink placeholder-fog outline-none" />
          </div>
          <div className="flex items-center gap-3 bg-mist rounded-2xl px-4 py-3">
            <Lock className="w-4 h-4 text-fog flex-none" />
            <input type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={de ? 'Passwort (mind. 6 Zeichen)' : 'Password (min. 6 chars)'}
              className="flex-1 bg-transparent text-sm text-ink placeholder-fog outline-none" />
            <button onClick={() => setShowPw((p) => !p)} className="text-fog flex-none">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-coral mb-3 px-1">{error}</p>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-wolt-base text-white font-semibold py-3.5 rounded-2xl text-sm mb-3 active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {de ? 'Konto erstellen' : 'Create Account'}
        </button>
        <p className="text-center text-sm text-fog">
          {de ? 'Bereits ein Konto? ' : 'Already have an account? '}
          <button onClick={onSwitchSignIn} className="text-wolt-base font-semibold">
            {de ? 'Anmelden' : 'Sign in'}
          </button>
        </p>
      </SheetWrap>
    </>
  )
}

/* ─── Photo Options Sheet ───────────────────────────────────────────────────── */
function PhotoOptionsSheet({ onClose, de, onCamera, onGallery, onAvatar }: {
  onClose: () => void; de: boolean
  onCamera: () => void
  onGallery: () => void
  onAvatar: () => void
}) {
  const options = [
    {
      icon: <Camera className="w-5 h-5 text-wolt-base" />,
      label: de ? 'Kamera' : 'Camera',
      sub:   de ? 'Selfie aufnehmen' : 'Take a selfie',
      action: onCamera,
    },
    {
      icon: <ImageIcon className="w-5 h-5 text-wolt-base" />,
      label: de ? 'Galerie' : 'Gallery',
      sub:   de ? 'Foto aus Bibliothek wählen' : 'Choose from library',
      action: onGallery,
    },
    {
      icon: <span className="text-xl leading-none">🦊</span>,
      label: de ? 'Avatar wählen' : 'Choose Avatar',
      sub:   de ? 'Süßes Tier als Profilbild' : 'Cute animal avatar',
      action: onAvatar,
    },
  ]

  return (
    <>
      <Backdrop onClose={onClose} />
      <SheetWrap>
        <SheetHeader title={de ? 'Profilbild ändern' : 'Change Profile Photo'} onClose={onClose} />
        <div className="space-y-2 pb-2">
          {options.map(({ icon, label, sub, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center gap-4 bg-mist hover:bg-cloud rounded-2xl px-4 py-4 active:scale-[0.98] transition-all text-left"
            >
              <div className="w-10 h-10 bg-wolt-light rounded-xl flex items-center justify-center flex-none">
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{label}</p>
                <p className="text-xs text-fog mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </SheetWrap>
    </>
  )
}

/* ─── Avatar Picker Sheet ───────────────────────────────────────────────────── */
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025 } },
}
const emojiVariants = {
  hidden: { scale: 0, opacity: 0 },
  show:   { scale: 1, opacity: 1, transition: { type: 'spring' as const, damping: 14, stiffness: 380 } },
}

function AvatarPickerSheet({ onClose, de, current, onSelect, onUpload }: {
  onClose: () => void; de: boolean
  current: string | undefined
  onSelect: (emoji: string) => Promise<void>
  onUpload: () => void
}) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelect = async (emoji: string) => {
    if (loading) return
    setLoading(emoji)
    await onSelect(emoji)
    setLoading(null)
    onClose()
  }

  return (
    <>
      <Backdrop onClose={onClose} />
      <SheetWrap>
        <SheetHeader title={de ? 'Avatar wählen' : 'Choose Avatar'} onClose={onClose} />

        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-6 gap-2 mb-5"
        >
          {PRESET_AVATARS.map((emoji) => {
            const isSelected = current === emoji
            const isLoading  = loading === emoji
            return (
              <motion.button
                key={emoji}
                variants={emojiVariants}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleSelect(emoji)}
                className={`
                  aspect-square rounded-2xl flex items-center justify-center text-2xl
                  transition-colors
                  ${isSelected
                    ? 'bg-wolt-light ring-2 ring-wolt-base ring-offset-2'
                    : 'bg-mist hover:bg-cloud active:bg-cloud'}
                `}
              >
                {isLoading
                  ? <RefreshCw className="w-4 h-4 text-wolt-base animate-spin" />
                  : emoji
                }
              </motion.button>
            )
          })}
        </motion.div>

        <button
          onClick={onUpload}
          className="w-full flex items-center justify-center gap-2 border border-cloud bg-canvas rounded-2xl py-3.5 text-sm font-medium text-ink active:scale-[0.98] transition-transform"
        >
          <ImageIcon className="w-4 h-4 text-wolt-base" />
          {de ? 'Eigenes Foto hochladen' : 'Upload own photo'}
        </button>
      </SheetWrap>
    </>
  )
}

/* ─── Change Password Sheet ─────────────────────────────────────────────────── */
function ChangePasswordSheet({ onClose, de, changePassword }: {
  onClose: () => void; de: boolean
  changePassword: (pw: string) => Promise<import('@supabase/supabase-js').AuthError | null>
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async () => {
    if (!password) { setError(de ? 'Bitte Passwort eingeben.' : 'Enter a password.'); return }
    if (password.length < 6) { setError(de ? 'Mind. 6 Zeichen.' : 'Min. 6 characters.'); return }
    if (password !== confirm) { setError(de ? 'Passwörter stimmen nicht überein.' : 'Passwords do not match.'); return }
    setLoading(true)
    const err = await changePassword(password)
    setLoading(false)
    if (err) setError(err.message)
    else setSuccess(true)
  }

  return (
    <>
      <Backdrop onClose={onClose} />
      <SheetWrap>
        <SheetHeader title={de ? 'Passwort ändern' : 'Change Password'} onClose={onClose} />
        {success ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald" />
            </div>
            <p className="text-base font-bold text-ink">
              {de ? 'Passwort erfolgreich geändert!' : 'Password changed successfully!'}
            </p>
            <button onClick={onClose}
              className="w-full bg-wolt-base text-white font-semibold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-transform">
              OK
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 bg-mist rounded-2xl px-4 py-3">
                <Lock className="w-4 h-4 text-fog flex-none" />
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder={de ? 'Neues Passwort' : 'New password'}
                  className="flex-1 bg-transparent text-sm text-ink placeholder-fog outline-none"
                />
                <button onClick={() => setShowPw((p) => !p)} className="text-fog flex-none">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-3 bg-mist rounded-2xl px-4 py-3">
                <Lock className="w-4 h-4 text-fog flex-none" />
                <input
                  type={showPw ? 'text' : 'password'} value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder={de ? 'Passwort bestätigen' : 'Confirm password'}
                  className="flex-1 bg-transparent text-sm text-ink placeholder-fog outline-none"
                />
              </div>
            </div>
            {error && <p className="text-xs text-coral mb-3 px-1">{error}</p>}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-wolt-base text-white font-semibold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {de ? 'Passwort ändern' : 'Change Password'}
            </button>
          </>
        )}
      </SheetWrap>
    </>
  )
}

/* ─── Privacy Sheet ─────────────────────────────────────────────────────────── */
function PrivacySheet({ onClose, de }: { onClose: () => void; de: boolean }) {
  return (
    <>
      <Backdrop onClose={onClose} />
      <SheetWrap>
        <SheetHeader title={de ? 'Datenschutz' : 'Privacy'} onClose={onClose} />
        <div className="space-y-4 text-sm text-fog leading-relaxed pb-2">
          <p className="font-semibold text-ink text-base">{de ? 'Datenschutzerklärung' : 'Privacy Policy'}</p>
          <p>{de ? 'Sepette nimmt den Schutz deiner persönlichen Daten ernst. Deine Daten werden sicher über Supabase (EU-Server) gespeichert.' : 'Sepette takes your data protection seriously. Your data is stored securely via Supabase (EU servers).'}</p>
          <p className="font-medium text-ink">{de ? 'Was wir speichern' : 'What we store'}</p>
          <p>{de ? 'E-Mail-Adresse und Name (für dein Konto), gespeicherte Lieferadressen, Bestellhistorie. Passwörter werden verschlüsselt gespeichert — wir sehen sie nie.' : 'Email address and name (for your account), saved delivery addresses, order history. Passwords are encrypted — we never see them.'}</p>
          <p className="font-medium text-ink">{de ? 'Cookies & Tracking' : 'Cookies & Tracking'}</p>
          <p>{de ? 'Wir verwenden keine Tracking-Cookies oder Analyse-Tools von Drittanbietern.' : 'We do not use tracking cookies or third-party analytics tools.'}</p>
          <p className="font-medium text-ink">{de ? 'Datenlöschung' : 'Data Deletion'}</p>
          <p>{de ? 'Du kannst dein Konto und alle damit verbundenen Daten jederzeit löschen.' : 'You can delete your account and all associated data at any time.'}</p>
          <p className="text-xs text-fog/70">Stand: Mai 2026 · Sepette v1.0</p>
        </div>
      </SheetWrap>
    </>
  )
}

/* ─── About Sheet ───────────────────────────────────────────────────────────── */
function AboutSheet({ onClose, de }: { onClose: () => void; de: boolean }) {
  const feats = de
    ? ['5 Restaurants in Neu-Ulm', 'Vollständige La Mila Speisekarte', 'Echtzeit-Bestellhistorie (Supabase)', 'Echte E-Mail-Authentifizierung', 'Gespeicherte Lieferadressen', 'Deutsch / Englisch', 'Dunkel- & Hellmodus']
    : ['5 restaurants in Neu-Ulm', 'Full La Mila menu', 'Real-time order history (Supabase)', 'Real email authentication', 'Saved delivery addresses', 'German / English', 'Dark & light mode']
  return (
    <>
      <Backdrop onClose={onClose} />
      <SheetWrap>
        <SheetHeader title={de ? 'Über Sepette' : 'About Sepette'} onClose={onClose} />
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-20 h-20 rounded-3xl bg-wolt-base flex items-center justify-center text-4xl shadow-wolt">🛒</div>
          <p className="font-bold text-ink text-xl mt-1">Sepette</p>
          <span className="text-xs text-fog bg-mist px-3 py-1 rounded-full">Version 1.0.0</span>
          <p className="text-sm text-fog text-center mt-1">
            {de ? 'Dein lokaler Lieferservice für Neu-Ulm' : 'Your local delivery service for Neu-Ulm'}
          </p>
        </div>
        <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-2 px-1">Features</p>
        <div className="bg-mist rounded-2xl p-3 space-y-2 mb-4">
          {feats.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-ink">
              <Check className="w-4 h-4 text-emerald flex-none" />{f}
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-2 px-1">Stack</p>
        <div className="bg-mist rounded-2xl p-3 mb-4">
          <p className="text-sm text-fog leading-relaxed">
            React 18 · TypeScript · Vite · TailwindCSS v3 · Framer Motion v11 · Zustand · Supabase
          </p>
        </div>
        <p className="text-center text-xs text-fog pb-2">
          {de ? 'Erstellt von Mehmet · Neu-Ulm · 2026' : 'Built by Mehmet · Neu-Ulm · 2026'}
        </p>
      </SheetWrap>
    </>
  )
}

/* ─── Main ──────────────────────────────────────────────────────────────────── */
export function Profile() {
  const { lang } = useLangStore()
  const { notifications, notifPermission, requestNotifications } = useSettingsStore()
  const { theme, toggleTheme } = useThemeStore()
  const auth = useAuth()
  const { activeAddress } = useSettingsStore()
  const [sheet, setSheet] = useState<Sheet>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileRef    = useRef<HTMLInputElement>(null)
  const cameraRef  = useRef<HTMLInputElement>(null)
  const de = lang === 'de'
  const close = () => setSheet(null)

  const displayName = auth.user?.user_metadata?.full_name ?? auth.user?.email?.split('@')[0] ?? ''
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : null
  const avatarUrl   = auth.user?.user_metadata?.avatar_url   as string | undefined
  const avatarEmoji = auth.user?.user_metadata?.avatar_emoji as string | undefined
  const isEmailProvider = auth.user?.app_metadata?.provider === 'email'

  const handleSignOut = async () => {
    await auth.signOut()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    await auth.uploadAvatar(file)
    setAvatarLoading(false)
    e.target.value = ''
  }

  const openWithDelay = (ref: React.RefObject<HTMLInputElement | null>) => {
    close()
    setTimeout(() => ref.current?.click(), 250)
  }

  const handleCameraOpen  = () => openWithDelay(cameraRef)
  const handleGalleryOpen = () => openWithDelay(fileRef)
  const handleAvatarOpen  = () => { close(); setTimeout(() => setSheet('avatarpicker'), 250) }

  if (auth.loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-wolt-base animate-spin" />
      </div>
    )
  }

  return (
    <>
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-dvh">
        <div className="pt-safe px-4 pb-3 bg-snow sticky top-0 z-30 border-b border-cloud">
          <h1 className="text-xl font-bold text-ink">{de ? 'Profil' : 'Profile'}</h1>
        </div>

        <div className="px-4 pt-5 mb-nav space-y-6">

          {/* Avatar card */}
          <div className="flex items-center gap-4 bg-canvas rounded-3xl p-4 shadow-card">
            <div className="relative flex-none">
              <div className="w-14 h-14 rounded-full bg-wolt-light overflow-hidden flex items-center justify-center text-2xl font-bold text-wolt-base select-none">
                {avatarEmoji
                  ? avatarEmoji
                  : avatarUrl
                    ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    : initials ?? '👤'
                }
                {avatarLoading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>
              {auth.user && (
                <button
                  onClick={() => setSheet('photooptions')}
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-wolt-base rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-ink truncate">
                {auth.user ? displayName : (de ? 'Gast-Nutzer' : 'Guest user')}
              </p>
              <p className="text-xs text-fog mt-0.5 truncate">
                {auth.user ? auth.user.email : (de ? 'Konto erstellen für mehr Features' : 'Create account for more features')}
              </p>
            </div>
            {!auth.user && (
              <button onClick={() => setSheet('signin')}
                className="bg-wolt-base text-white text-sm font-semibold px-3 py-2 rounded-xl flex-none">
                {de ? 'Anmelden' : 'Sign in'}
              </button>
            )}
          </div>

          {/* hidden file inputs — gallery + camera */}
          <input ref={fileRef}   type="file" accept="image/*"                    className="hidden" onChange={handleAvatarChange} />
          <input ref={cameraRef} type="file" accept="image/*" capture="user"     className="hidden" onChange={handleAvatarChange} />

          {/* Account */}
          <div>
            <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-2 px-1">
              {de ? 'Konto' : 'Account'}
            </p>
            <div className="bg-canvas rounded-3xl shadow-card overflow-hidden">
              <SettingRow icon={MapPin} label={de ? 'Adressen' : 'Addresses'}
                value={activeAddress || (de ? 'Keine' : 'None')}
                action={() => setSheet('address')} />
              {auth.user && isEmailProvider && (
                <SettingRow icon={Lock}
                  label={de ? 'Passwort ändern' : 'Change Password'}
                  action={() => setSheet('password')} />
              )}
              <ToggleRow icon={Bell}
                label={de ? 'Benachrichtigungen' : 'Notifications'}
                on={notifications}
                onToggle={requestNotifications}
                border={false} />
              {notifPermission === 'denied' && (
                <p className="text-[11px] text-amber-500 px-4 pb-3 -mt-1">
                  {de
                    ? 'Benachrichtigungen im Browser blockiert. Bitte in den Browser-Einstellungen erlauben.'
                    : 'Notifications blocked in browser. Please allow in browser settings.'}
                </p>
              )}
            </div>
          </div>

          {/* Order history (only when logged in) */}
          {auth.user && (
            <div>
              <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-2 px-1">
                {de ? 'Bestellungen' : 'Orders'}
              </p>
              <div className="bg-canvas rounded-3xl shadow-card overflow-hidden">
                <SettingRow icon={ClipboardList}
                  label={de ? 'Bestellhistorie' : 'Order History'}
                  action={() => window.location.href = '/orders'}
                  border={false} />
              </div>
            </div>
          )}

          {/* General */}
          <div>
            <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-2 px-1">
              {de ? 'Allgemein' : 'General'}
            </p>
            <div className="bg-canvas rounded-3xl shadow-card overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-cloud">
                <div className="w-8 h-8 bg-wolt-light rounded-xl flex items-center justify-center flex-none">
                  <Globe className="w-4 h-4 text-wolt-base" />
                </div>
                <span className="flex-1 text-sm font-medium text-ink">{de ? 'Sprache' : 'Language'}</span>
                <LangToggle size="md" />
              </div>
              <ToggleRow icon={theme === 'dark' ? Moon : Sun}
                label={de ? 'Dunkelmodus' : 'Dark mode'}
                on={theme === 'dark'} onToggle={toggleTheme} />
              <SettingRow icon={Shield} label={de ? 'Datenschutz' : 'Privacy'} action={() => setSheet('privacy')} />
              <SettingRow icon={Info} label={de ? 'Über Sepette' : 'About Sepette'} value="v1.0"
                action={() => setSheet('about')} border={false} />
            </div>
          </div>

          {/* Sign out / Create account */}
          {auth.user ? (
            <button onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-coral/30 text-coral text-sm font-semibold hover:bg-coral/5 transition-colors active:scale-[0.98]">
              <LogOut className="w-4 h-4" />
              {de ? 'Abmelden' : 'Sign out'}
            </button>
          ) : (
            <button onClick={() => setSheet('signup')}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-wolt-base/30 text-wolt-base text-sm font-semibold hover:bg-wolt-light transition-colors active:scale-[0.98]">
              <UserIcon className="w-4 h-4" />
              {de ? 'Neues Konto erstellen' : 'Create new account'}
            </button>
          )}

          <p className="text-center text-xs text-fog pb-2">Sepette · Neu-Ulm · {new Date().getFullYear()}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {auth.emailPending && (
          <EmailPendingSheet key="pending" email={auth.emailPending} onClose={auth.clearPending} de={de} />
        )}
        {sheet === 'address'  && <AddressModal key="address" onClose={close} de={de} />}
        {sheet === 'privacy'  && <PrivacySheet key="privacy" onClose={close} de={de} />}
        {sheet === 'about'    && <AboutSheet   key="about"   onClose={close} de={de} />}
        {sheet === 'password' && (
          <ChangePasswordSheet key="password" onClose={close} de={de} changePassword={auth.changePassword} />
        )}
        {sheet === 'photooptions' && (
          <PhotoOptionsSheet
            key="photooptions" onClose={close} de={de}
            onCamera={handleCameraOpen}
            onGallery={handleGalleryOpen}
            onAvatar={handleAvatarOpen}
          />
        )}
        {sheet === 'avatarpicker' && (
          <AvatarPickerSheet
            key="avatarpicker" onClose={close} de={de}
            current={avatarEmoji}
            onSelect={auth.setAvatarEmoji}
            onUpload={handleGalleryOpen}
          />
        )}
        {sheet === 'signin' && (
          <SignInSheet key="signin" onClose={close} de={de} signIn={auth.signIn}
            signInWithGoogle={auth.signInWithGoogle} signInWithApple={auth.signInWithApple}
            onSwitchSignUp={() => setSheet('signup')} />
        )}
        {sheet === 'signup' && (
          <SignUpSheet key="signup" onClose={close} de={de} signUp={auth.signUp}
            signInWithGoogle={auth.signInWithGoogle} signInWithApple={auth.signInWithApple}
            onSwitchSignIn={() => setSheet('signin')} />
        )}
      </AnimatePresence>
    </>
  )
}