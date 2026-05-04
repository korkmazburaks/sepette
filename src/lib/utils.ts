import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { WeekHours } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function computeIsOpen(hours: WeekHours): boolean {
  const now = new Date()
  const day = hours[now.getDay()]
  if (!day) return false
  const cur = now.getHours() * 60 + now.getMinutes()
  const [oh, om] = day.open.split(':').map(Number)
  const [ch, cm] = day.close.split(':').map(Number)
  return cur >= oh * 60 + om && cur < ch * 60 + cm
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

// Neu-Ulm center — delivery radius 15 km
const ZONE_CENTER = { lat: 48.3957, lng: 9.9965 }
const ZONE_RADIUS_KM = 15

export function isInDeliveryZone(lat: number, lng: number): boolean {
  return haversineKm(ZONE_CENTER.lat, ZONE_CENTER.lng, lat, lng) <= ZONE_RADIUS_KM
}