import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { MenuCategory } from '@/types'

interface MenuTabsProps {
  categories: MenuCategory[]
}

export function MenuTabs({ categories }: MenuTabsProps) {
  const [active, setActive] = useState(categories[0]?.id ?? '')
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollTo = (id: string) => {
    setActive(id)
    const el = document.getElementById(`cat-${id}`)
    if (el) {
      const offset = 56 + 48 // hero info height approx
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (!categories.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(e => e.isIntersecting)
        if (visible) {
          const id = visible.target.id.replace('cat-', '')
          setActive(id)
        }
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 },
    )
    categories.forEach(c => {
      const el = document.getElementById(`cat-${c.id}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [categories])

  return (
    <div ref={scrollRef} className="scroll-x flex gap-2 px-4 py-2 bg-snow sticky top-0 z-10 border-b border-cloud">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => scrollTo(cat.id)}
          className={cn(
            'flex-none px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all',
            active === cat.id
              ? 'bg-wolt-base text-white shadow-wolt'
              : 'bg-canvas text-slate border border-cloud',
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}