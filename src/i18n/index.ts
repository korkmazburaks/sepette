export type Lang = 'de' | 'en'

const translations = {
  de: {
    appName: 'Sepette',
    tagline: 'Neu-Ulms Lieblingsessen, direkt zu dir',
    location: 'Neu-Ulm',
    search: 'Restaurant oder Gericht suchen...',
    categories: {
      all: 'Alle',
      pizza: 'Pizza',
      burger: 'Burger',
      kebab: 'Kebab',
      sushi: 'Sushi',
      asian: 'Asiatisch',
      salad: 'Salat',
    },
    restaurant: {
      delivery: 'Lieferung',
      free: 'Gratis',
      minOrder: 'Mindestbestellung',
      reviews: 'Bewertungen',
      closed: 'Geschlossen',
      open: 'Geöffnet',
      min: 'Min.',
      menuEmpty: 'Speisekarte wird geladen…',
    },
    cart: {
      title: 'Warenkorb',
      subtotal: 'Zwischensumme',
      delivery: 'Liefergebühr',
      total: 'Gesamt',
      order: 'Bestellung aufgeben',
      empty: 'Dein Warenkorb ist leer',
      items: (n: number) => `${n} Artikel`,
    },
    nav: {
      home: 'Start',
      search: 'Suche',
      orders: 'Bestellungen',
      profile: 'Profil',
    },
  },
  en: {
    appName: 'Sepette',
    tagline: "Neu-Ulm's flavors, at your door",
    location: 'Neu-Ulm',
    search: 'Search restaurant or dish...',
    categories: {
      all: 'All',
      pizza: 'Pizza',
      burger: 'Burger',
      kebab: 'Kebab',
      sushi: 'Sushi',
      asian: 'Asian',
      salad: 'Salad',
    },
    restaurant: {
      delivery: 'Delivery',
      free: 'Free',
      minOrder: 'Min. order',
      reviews: 'reviews',
      closed: 'Closed',
      open: 'Open',
      min: 'min',
      menuEmpty: 'Menu loading…',
    },
    cart: {
      title: 'Cart',
      subtotal: 'Subtotal',
      delivery: 'Delivery fee',
      total: 'Total',
      order: 'Place order',
      empty: 'Your cart is empty',
      items: (n: number) => `${n} item${n !== 1 ? 's' : ''}`,
    },
    nav: {
      home: 'Home',
      search: 'Search',
      orders: 'Orders',
      profile: 'Profile',
    },
  },
} as const

export type Translations = typeof translations.de | typeof translations.en

export function getT(lang: Lang) {
  return translations[lang]
}