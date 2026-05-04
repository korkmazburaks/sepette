import type { MenuCategory as MenuCategoryType } from '@/types'
import { MenuItem } from './MenuItem'

interface MenuCategoryProps {
  category: MenuCategoryType
  restaurantId: string
  restaurantSlug: string
  restaurantName: string
  isOpen: boolean
}

export function MenuCategory({ category, restaurantId, restaurantSlug, restaurantName, isOpen }: MenuCategoryProps) {
  return (
    <div id={`cat-${category.id}`} className="px-4">
      <h2 className="text-base font-bold text-ink py-3">{category.name}</h2>
      {category.items.map(item => (
        <MenuItem key={item.id} item={item} restaurantId={restaurantId} restaurantSlug={restaurantSlug} restaurantName={restaurantName} isOpen={isOpen} />
      ))}
    </div>
  )
}