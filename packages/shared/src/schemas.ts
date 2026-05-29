import { z } from "zod";

// Re-export Zod schemas that mirror the types.
// Used for runtime validation on both frontend and backend.

export const UUIDSchema = z.string().uuid();

export const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string().nullable(),
  is_primary: z.boolean(),
});

export const ProductSchema = z.object({
  id: UUIDSchema,
  vendor_id: UUIDSchema,
  title: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().positive(),
  compare_at_price: z.number().positive().nullable(),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  tags: z.array(z.string()),
  brand: z.string().nullable(),
  sku: z.string().nullable(),
  inventory_count: z.number().int().min(0),
  status: z.enum(["active", "draft", "archived"]),
  attributes: z.record(z.unknown()).nullable(),
  images: z.array(ProductImageSchema),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CartItemSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  product_id: UUIDSchema,
  variant_id: UUIDSchema.nullable(),
  quantity: z.number().int().min(1),
  added_by_agent: z.boolean(),
  created_at: z.string().datetime(),
});

export const AddToCartSchema = z.object({
  product_id: UUIDSchema,
  variant_id: UUIDSchema.optional(),
  quantity: z.number().int().min(1).default(1),
});

export const CreateOrderSchema = z.object({
  address_id: UUIDSchema,
  payment_method_id: UUIDSchema,
});

export const AnalyticsQuerySchema = z.object({
  prompt: z.string().min(1),
  vendor_id: UUIDSchema,
  date_range: z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    })
    .optional(),
});

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const SendChatMessageSchema = z.object({
  message: z.string().min(1),
  session_id: z.string().optional(),
});
