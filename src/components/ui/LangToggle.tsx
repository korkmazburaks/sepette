import { motion } from 'framer-motion'
import { useLangStore } from '@/store/langStore'
import type { Lang } from '@/i18n'

interface LangToggleProps {
  size?: 'sm' | 'md'
}

export function LangToggle({ size = 'md' }: LangToggleProps) {
  const { lang, setLang } = useLangStore()

  const compact = size === 'sm'

  return (
    <div className={`relative flex bg-mist rounded-xl p-0.5 gap-0.5 ${compact ? 'h-8' : 'h-9'}`}>
      {/* sliding pill */}
      <motion.div
        layout
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="absolute inset-0.5 w-[calc(50%-2px)] bg-canvas rounded-[10px] shadow-card"
        style={{ left: lang === 'de' ? '2px' : 'calc(50% + 2px)' }}
      />
      {(['de', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`relative z-10 flex-1 flex items-center justify-center font-bold transition-colors rounded-[10px] ${
            compact ? 'text-[10px] px-2' : 'text-xs px-3'
          } ${lang === l ? 'text-ink' : 'text-fog'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}