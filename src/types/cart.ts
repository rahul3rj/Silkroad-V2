// Cart and CartItem TypeScript types

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  slug: string;
  brand: string;
  size: string;
  quantity: number;
  price: number; // unit price in pence
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
