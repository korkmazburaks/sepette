import { useLangStore } from '@/store/langStore'

interface SectionHeaderProps {
  label: string
  count?: number
}

export function SectionHeader({ label, count }: SectionHeaderProps) {
  const { lang } = useLangStore()
  return (
    <div className="px-4 flex items-center justify-between mb-3">
      <h2 className="font-bold text-ink text-base">{label}</h2>
      {count != null && (
        <span className="text-xs text-fog">
          {count} {lang === 'de' ? 'Restaurants' : 'restaurants'}
        </span>
      )}
    </div>
  )
}