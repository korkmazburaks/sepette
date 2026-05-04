import type { MenuCategory } from '@/types'

export const PIZZA_PALACE_MENU: MenuCategory[] = [
  {
    id: 'pizzas',
    name: 'Pizza',
    items: [
      { id: 'pp-p1', name: 'Margherita', price: 8.90, description: 'Tomatensauce, Mozzarella, Basilikum', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
      { id: 'pp-p2', name: 'Salami Piccante', price: 11.90, description: 'Tomatensauce, Mozzarella, scharfe Salami', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80' },
      { id: 'pp-p3', name: 'Tonno e Cipolla', price: 12.50, description: 'Thunfisch, rote Zwiebeln, Mozzarella' },
      { id: 'pp-p4', name: 'Quattro Stagioni', price: 13.90, description: 'Schinken, Champignons, Artischocken, Paprika' },
    ],
  },
  {
    id: 'pasta-pp',
    name: 'Pasta',
    items: [
      { id: 'pp-pa1', name: 'Spaghetti Bolognese', price: 10.90, description: 'Klassische Hackfleischsauce', imageUrl: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&q=80' },
      { id: 'pp-pa2', name: 'Penne Arrabbiata', price: 9.90, description: 'Pikante Tomatensauce, Knoblauch, Chili' },
    ],
  },
  {
    id: 'drinks-pp',
    name: 'Getränke',
    items: [
      { id: 'pp-g1', name: 'Coca-Cola 0,33 l', price: 3.00 },
      { id: 'pp-g2', name: 'Wasser 0,5 l', price: 2.00 },
    ],
  },
]

export const BURGER_HOUSE_MENU: MenuCategory[] = [
  {
    id: 'burgers',
    name: 'Burger',
    items: [
      { id: 'bh-b1', name: 'Classic Burger', price: 9.90, description: 'Rindfleisch, Salat, Tomate, Zwiebeln, Ketchup', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', popular: true },
      { id: 'bh-b2', name: 'Double Smash Burger', price: 13.90, description: 'Zwei Smash-Patties, Cheddar, Speck, Spezialsauce', imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80' },
      { id: 'bh-b3', name: 'Chicken Crispy', price: 10.90, description: 'Knuspriges Hähnchenfilet, Coleslaw, Honig-Senf' },
      { id: 'bh-b4', name: 'Veggie Mushroom', price: 9.90, description: 'Pilz-Patty, Avocado, Rucola, Aioli' },
    ],
  },
  {
    id: 'sides-bh',
    name: 'Beilagen',
    items: [
      { id: 'bh-s1', name: 'Pommes frites', price: 3.90, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80' },
      { id: 'bh-s2', name: 'Onion Rings', price: 4.50, description: '6 Stück' },
      { id: 'bh-s3', name: 'Coleslaw', price: 2.90 },
    ],
  },
  {
    id: 'drinks-bh',
    name: 'Getränke',
    items: [
      { id: 'bh-g1', name: 'Coca-Cola 0,33 l', price: 2.90 },
      { id: 'bh-g2', name: 'Milkshake Vanilla', price: 4.50 },
    ],
  },
]

export const SUSHI_GARDEN_MENU: MenuCategory[] = [
  {
    id: 'nigiri',
    name: 'Nigiri & Sashimi',
    items: [
      { id: 'sg-n1', name: 'Lachs Nigiri (2 Stück)', price: 5.90, description: 'Frischer Lachs auf Sushi-Reis', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80' },
      { id: 'sg-n2', name: 'Thunfisch Nigiri (2 Stück)', price: 6.50, description: 'Frischer Thunfisch auf Sushi-Reis' },
      { id: 'sg-n3', name: 'Lachs Sashimi (5 Stück)', price: 11.90, description: 'Premium Lachs, ohne Reis' },
    ],
  },
  {
    id: 'maki',
    name: 'Maki & Rolls',
    items: [
      { id: 'sg-m1', name: 'California Roll (8 Stück)', price: 9.90, description: 'Surimi, Avocado, Gurke', imageUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80', popular: true },
      { id: 'sg-m2', name: 'Spicy Tuna Roll (8 Stück)', price: 11.90, description: 'Thunfisch, Sriracha, Gurke' },
      { id: 'sg-m3', name: 'Dragon Roll (8 Stück)', price: 13.90, description: 'Garnelen Tempura, Avocado, Aal-Sauce' },
      { id: 'sg-m4', name: 'Veggie Roll (8 Stück)', price: 8.90, description: 'Gurke, Avocado, Karotte, Ingwer' },
    ],
  },
  {
    id: 'drinks-sg',
    name: 'Getränke',
    items: [
      { id: 'sg-g1', name: 'Japanischer Grüntee', price: 3.50 },
      { id: 'sg-g2', name: 'Mango Lemonade', price: 4.00 },
    ],
  },
]

export const DON_GIOVANNI_MENU: MenuCategory[] = [
  {
    id: 'antipasti-dg',
    name: 'Antipasti',
    items: [
      { id: 'dg-a1', name: 'Bruschetta al Pomodoro', price: 6.50, description: 'Geröstet mit Tomaten, Basilikum, Olivenöl', imageUrl: 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=400&q=80' },
      { id: 'dg-a2', name: 'Carpaccio di Manzo', price: 13.90, description: 'Hauchdünnes Rinderfilet, Rucola, Parmesan, Kapern' },
    ],
  },
  {
    id: 'pasta-dg',
    name: 'Pasta',
    items: [
      { id: 'dg-p1', name: 'Tagliatelle al Tartufo', price: 16.90, description: 'Schwarze Trüffelsauce, Parmesan', imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80', popular: true },
      { id: 'dg-p2', name: 'Rigatoni all\'Amatriciana', price: 13.90, description: 'Guanciale, Pecorino, Tomaten, Peperoncino' },
      { id: 'dg-p3', name: 'Gnocchi al Gorgonzola', price: 13.50, description: 'Hausgemachte Gnocchi, Gorgonzola-Sahnesauce' },
      { id: 'dg-p4', name: 'Spaghetti alle Vongole', price: 17.90, description: 'Venusmuscheln, Weißwein, Knoblauch, Petersilie' },
    ],
  },
  {
    id: 'drinks-dg',
    name: 'Getränke',
    items: [
      { id: 'dg-g1', name: 'San Pellegrino 0,5 l', price: 3.50 },
      { id: 'dg-g2', name: 'Prosecco (Glas)', price: 5.90 },
    ],
  },
]