export interface Order {
  id: string;
  item_count: number;
  total: number | string;
  payment: string;
  status: string;
  created_at: string;
  customer_id: string;
  address_id: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  coupon_code?: string;
  tracking_id?: string;
  notes?: string;
  updated_at: string;
  // Joined data
  customer?: {
    full_name: string;
    email: string;
  };
  address?: Address;
  order_items?: OrderItem[];
  // Legacy support or fallback
  customer_name?: string;
  customer_email?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total_price: number;
  image: string;
  selected_size?: string;
  selected_color?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  old_price?: number;
  discount?: string;
  stock: number;
  stock_status: string;
  status: string;
  badges: string[];
  image: string;
  description?: string;
  size_chart?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  provider?: string;
  whatsapp_opted_in?: boolean;
  total_orders: number;
  total_spent: number | string;
  last_order_at?: string;
  status: string;
  created_at: string;
  last_login_at?: string;
  // Legacy support
  name?: string;
  spent?: string | number;
  joined?: string;
  orders?: number;
}

export interface Address {
  id: string;
  customer_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  district: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'order' | 'user' | 'system' | 'alert';
  is_read: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon_name: string;
  active: boolean;
  count: number;
  display_order: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  parent_id: string | null;
  name: string;
  count: number;
  display_order: number;
}

export interface FlashSaleSettings {
  id: number;
  active: boolean;
  start_date: string;
  end_date: string;
  default_discount: number;
  updated_at: string;
}

export interface FlashSaleItem {
  id: string;
  product_id: string;
  sale_price: number;
  discount: number;
  stock: number;
  sold: number;
  created_at: string;
  products?: {
    name: string;
    image: string;
    price: number;
  };
}

export interface HomepageSection {
  id: string;
  name: string;
  active: boolean;
  type: "banner" | "products" | "categories" | "content" | "middle_banner" | "double_banner";
  display_order: number;
  promo_banners?: {
    image_url: string;
    title: string;
    subtitle: string;
    button_text: string;
    button_link: string;
    alignment: string;
  };
  product_grids?: {
    source: string;
    selected_category: string;
    selected_products: string[];
    item_count: number;
  };
}

export interface StoreSettings {
  id: string;
  store_name?: string;
  store_tagline?: string;
  store_email?: string;
  store_phone?: string;
  store_address?: string;
  maintenance_mode: boolean;
  maintenance_message?: string;
  free_shipping_enabled: boolean;
  free_shipping_threshold?: number;
  free_shipping_label?: string;
  cod_enabled: boolean;
  cod_extra_charge?: number;
  cod_min_order?: number;
  social_links: {
    label: string;
    icon: string;
    value: string;
    active: boolean;
  }[];
  payment_methods: {
    name: string;
    icon: string;
    active: boolean;
  }[];
  notifications_admin: {
    label: string;
    desc: string;
    active: boolean;
  }[];
  notifications_customer: {
    label: string;
    desc: string;
    active: boolean;
  }[];
  share_buttons: {
    label: string;
    active: boolean;
  }[];
  low_stock_threshold: number;
  low_stock_enabled: boolean;
  announcement_bar_text?: string;
  updated_at?: string;
}

export interface ShippingRate {
  id: string;
  name: string;
  min_order?: number;
  rate?: number;
  delivery_time?: string;
  created_at?: string;
}

export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  avatar_url?: string;
  created_at: string;
}
