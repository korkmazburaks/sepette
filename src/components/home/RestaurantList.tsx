import { motion } from 'framer-motion'
import type { Restaurant } from '@/types'
import { RestaurantCard } from './RestaurantCard'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

interface RestaurantListProps {
  restaurants: Restaurant[]
}

export function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 space-y-4"
    >
      {restaurants.map((r, i) => (
        <RestaurantCard key={r.id} restaurant={r} index={i} />
      ))}
    </motion.div>
  )
}