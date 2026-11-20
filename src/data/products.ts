import { Category, Product } from '../types';

export const CATEGORIES: Category[] = [
  'All',
  'Snacks',
  'Drinks',
  'Stationery',
  'Toiletries',
];

export const FREE_DELIVERY_THRESHOLD = 199;
export const STANDARD_DELIVERY_FEE = 15;

export const PRODUCTS: Product[] = [
  // Snacks
  {
    id: 'lays-chips',
    name: 'Lays Chips',
    category: 'Snacks',
    price: 20,
    emoji: '🥔',
  },
  {
    id: 'maggi-noodles',
    name: 'Maggi Noodles',
    category: 'Snacks',
    price: 14,
    emoji: '🍜',
  },
  {
    id: 'oreo-biscuits',
    name: 'Oreo Biscuits',
    category: 'Snacks',
    price: 30,
    emoji: '🍪',
  },
  {
    id: 'kurkure',
    name: 'Kurkure',
    category: 'Snacks',
    price: 20,
    emoji: '🥨',
  },

  // Drinks
  {
    id: 'cold-coffee-can',
    name: 'Cold Coffee Can',
    category: 'Drinks',
    price: 60,
    emoji: '☕',
  },
  {
    id: 'frooti-200ml',
    name: 'Frooti 200ml',
    category: 'Drinks',
    price: 20,
    emoji: '🥭',
  },
  {
    id: 'water-1l',
    name: 'Water 1L',
    category: 'Drinks',
    price: 20,
    emoji: '💧',
  },
  {
    id: 'energy-drink',
    name: 'Energy Drink',
    category: 'Drinks',
    price: 110,
    emoji: '⚡',
  },

  // Stationery
  {
    id: 'classmate-notebook',
    name: 'Classmate Notebook',
    category: 'Stationery',
    price: 65,
    emoji: '📓',
  },
  {
    id: 'gel-pens-5',
    name: 'Gel Pens (5)',
    category: 'Stationery',
    price: 50,
    emoji: '🖊️',
  },
  {
    id: 'a4-paper-50',
    name: 'A4 Paper (50)',
    category: 'Stationery',
    price: 90,
    emoji: '📄',
  },
  {
    id: 'highlighters',
    name: 'Highlighters',
    category: 'Stationery',
    price: 80,
    emoji: '🖍️',
  },

  // Toiletries
  {
    id: 'shampoo-sachets',
    name: 'Shampoo Sachets',
    category: 'Toiletries',
    price: 10,
    emoji: '🧴',
  },
  {
    id: 'toothpaste',
    name: 'Toothpaste',
    category: 'Toiletries',
    price: 60,
    emoji: '🪥',
  },
  {
    id: 'face-wash',
    name: 'Face Wash',
    category: 'Toiletries',
    price: 120,
    emoji: '🧼',
  },
  {
    id: 'detergent-500g',
    name: 'Detergent 500g',
    category: 'Toiletries',
    price: 75,
    emoji: '🧺',
  },
];
