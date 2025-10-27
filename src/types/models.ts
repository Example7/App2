export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

export interface ProductCardProps {
  product: Product;
  avgRating?: number;
  reviewCount?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onAddToCart?: () => void;
}

export type CartItem = Product & {
  quantity: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at?: string | null;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
};

export type Order = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  user_id: string;
};

export type OrderItem = {
  id: number;
  order_id: string;
  product_id: number;
  quantity: number;
  price: number;
  products?: {
    name: string;
  };
};

export interface Favorite {
  id: number;
  user_id: string;
  product_id: number;
}
