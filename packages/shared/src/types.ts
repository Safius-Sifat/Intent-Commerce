// Shared TypeScript types for Intent Commerce
// This package is imported by both frontend and backend

export type UUID = string;

export interface User {
  id: UUID;
  email: string;
  name: string | null;
  phone: string | null;
  created_at: string;
  preferences: Record<string, unknown> | null;
}

export interface Vendor {
  id: UUID;
  business_name: string;
  email: string;
  onboarding_complete: boolean;
  dashboard_config: Record<string, unknown> | null;
  created_at: string;
}

export interface Product {
  id: UUID;
  vendor_id: UUID;
  title: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: string | null;
  subcategory: string | null;
  tags: string[];
  brand: string | null;
  sku: string | null;
  inventory_count: number;
  status: "active" | "draft" | "archived";
  attributes: Record<string, unknown> | null;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  is_primary: boolean;
}

export interface ProductVariant {
  id: UUID;
  product_id: UUID;
  variant_name: string;
  sku: string | null;
  price_adjustment: number;
  inventory_count: number;
  attributes: Record<string, unknown> | null;
}

export interface CartItem {
  id: UUID;
  user_id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
  added_by_agent: boolean;
  created_at: string;
}

export interface Order {
  id: UUID;
  user_id: UUID;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  tax_amount: number;
  shipping_amount: number;
  shipping_address: Record<string, unknown> | null;
  payment_method: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  quantity: number;
  unit_price: number;
  vendor_id: UUID;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: string;
  tool_calls?: unknown[];
  tool_results?: unknown[];
}

export interface Conversation {
  id: UUID;
  user_id: UUID;
  session_id: string;
  messages: ConversationMessage[];
  context_state: Record<string, unknown> | null;
  created_at: string;
}

export interface AnalyticsQuery {
  prompt: string;
  vendor_id: UUID;
  date_range?: { start: string; end: string };
}

export interface ForecastResult {
  product_id: UUID;
  forecast_dates: string[];
  predicted_demand: number[];
  confidence_intervals?: { lower: number[]; upper: number[] };
  stockout_date?: string | null;
  recommended_restock_quantity?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  cart_actions?: { type: "add" | "remove"; product_id: UUID }[];
}
