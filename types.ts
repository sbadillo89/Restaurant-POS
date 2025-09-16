/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// --- CORE DATA MODELS ---

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string; // The category name, mapped from the DB relation
  inStock: boolean;
};

// FIX: Made properties readonly to match data structure from `useQuery`. `quantity` remains mutable for editing in modals.
export type OrderItem = {
  readonly productId: string;
  readonly name: string;
  quantity: number;
  readonly priceAtOrder: number;
};

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export type DiscountType = 'none' | 'percentage' | 'fixed';

// FIX: Made properties and nested `items` array readonly to match the deeply readonly data structure returned by `useQuery`.
export type Order = {
  readonly id:string;
  readonly items: readonly OrderItem[];
  readonly subtotal: number; // Sum of items before discount and tax
  readonly discountType: DiscountType;
  readonly discountValue: number; // The percentage or fixed amount
  readonly taxAmount: number; // Calculated tax
  readonly total: number; // Final amount after discount and tax
  readonly status: OrderStatus;
  readonly timestamp: string; // ISO 8601 string for timestamps
  readonly updated_at?: string; // ISO 8601 string for last update
  readonly note?: string;
  readonly cancellationNote?: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  timestamp: string; // ISO 8601 string for timestamps
};

export type Settings = {
  businessName: string;
  salesTaxRate: number; // Stored as a percentage, e.g., 8.25 for 8.25%
};

// --- ACTION PAYLOADS (Data Transfer Objects) ---
// Used for creating or updating data, simulating what would be sent to an API.

export type CreateProductPayload = {
  name: string;
  price: number;
  category_id: string;
  in_stock: boolean;
};

export type UpdateProductStockPayload = {
  productId: string;
  inStock: boolean;
};

export type CreateExpensePayload = Omit<Expense, 'id' | 'timestamp'>;

export type CreateOrderPayload = {
  items: OrderItem[];
  note?: string;
  discountType: DiscountType;
  discountValue: number;
};

export type EditOrderPayload = CreateOrderPayload & {
  orderId: string;
};

export type CreateCategoryPayload = {
  name: string;
};

export type UpdateSettingsPayload = Partial<Settings>;

export type UpdateOrderPayload = {
  orderId: string;
  updates: {
    status?: OrderStatus;
    updated_at?: string;
    cancellation_note?: string;
  }
};

export type CancelOrderPayload = {
  orderId: string;
  note: string;
};

// --- AUTHENTICATION ---

export type UserRole = 'admin' | 'waiter' | 'kitchen';

export type User = {
  id: string;
  username: string;
  role: UserRole;
};

export type CreateUserPayload = {
  username: string;
  password: string;
  role: UserRole;
};

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// --- DASHBOARD ---
export type DashboardStats = {
  income: number;
  totalExpenses: number;
  net: number;
  pendingOrders: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  averageOrderValue: number;
  topSellingProducts: { name: string; quantity: number }[];
};