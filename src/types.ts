export type Category = 'All' | 'Snacks' | 'Drinks' | 'Stationery' | 'Toiletries';

export type ProductCategory = Exclude<Category, 'All'>;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  emoji: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  category: ProductCategory;
  emoji: string;
  price: number;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  userId: string;
  userName: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  timeMs: number;
}
