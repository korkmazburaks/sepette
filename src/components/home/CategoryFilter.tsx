import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useLangStore } from '@/store/langStore'
import { getT } from '@/i18n'

const CATEGORIES = [
  { key: 'all',   emoji: '🍽️' },
  { key: 'pizza', emoji: '🍕' },
  { key: 'burger',emoji: '🍔' },
  { key: 'kebab', emoji: '🥙' },
  { key: 'sushi', emoji: '🍣' },
  { key: 'asian', emoji: '🍜' },
  { key: 'salad', emoji: '🥗' },
] as const

type CategoryKey = typeof CATEGORIES[number]['key']

interface CategoryFilterProps {
  onSelect?: (key: CategoryKey) => void
}

export function CategoryFilter({ onSelect }: CategoryFilterProps) {
  const [active, setActive] = useState<CategoryKey>('all')
  const { lang } = useLangStore()
  const t = getT(lang)

  const handleSelect = (key: CategoryKey) => {
    setActive(key)
    onSelect?.(key)
  }

  return (
    <div className="scroll-x flex gap-2 px-4 pb-2">
      {CATEGORIES.map(({ key, emoji }) => (
        <button
          key={key}
          onClick={() => handleSelect(key)}
          className={cn(
            'flex-none flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all',
            active === key
              ? 'bg-wolt-base text-white shadow-wolt'
              : 'bg-canvas text-slate border border-cloud hover:bg-mist',
          )}
        >
          <span>{emoji}</span>
          <span>{t.categories[key]}</span>
        </button>
      ))}
    </div>
  )
}