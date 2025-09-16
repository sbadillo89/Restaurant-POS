/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { Product, Order, Expense, Settings } from '../types';

// --- MOCK DATA ---
const initialCategories = ['Main', 'Dessert', 'Drink'];

const initialProducts: Product[] = [
  // FIX: Add missing 'inStock' property to all products to conform to the Product type.
  { id: 'p1', name: 'Margherita Pizza', price: 12.50, category: 'Main', inStock: true },
  { id: 'p2', name: 'Cheeseburger', price: 9.99, category: 'Main', inStock: true },
  { id: 'p3', name: 'Tiramisu', price: 6.00, category: 'Dessert', inStock: false },
  { id: 'p4', name: 'Cola', price: 2.50, category: 'Drink', inStock: true },
];

// FIX: Added missing properties to conform to the Order type for both order objects: subtotal, discountType, discountValue, taxAmount. Updated total to reflect calculations.
const initialOrders: Order[] = [
  // FIX: Convert Date to ISO string to match 'timestamp: string' type
  { id: 'o1', items: [{ productId: 'p1', name: 'Margherita Pizza', quantity: 1, priceAtOrder: 12.50 }, { productId: 'p4', name: 'Cola', quantity: 2, priceAtOrder: 2.50 }], subtotal: 17.50, discountType: 'none', discountValue: 0, taxAmount: 1.31, total: 18.81, status: 'completed', timestamp: new Date(new Date().setHours(12, 30)).toISOString() },
  // FIX: Convert Date to ISO string to match 'timestamp: string' type
  { id: 'o2', items: [{ productId: 'p2', name: 'Cheeseburger', quantity: 2, priceAtOrder: 9.99 }], subtotal: 19.98, discountType: 'fixed', discountValue: 2, taxAmount: 1.35, total: 19.33, status: 'pending', timestamp: new Date(new Date().setHours(13, 0)).toISOString(), note: 'Extra pickles, no onion.' },
];

const initialExpenses: Expense[] = [
  // FIX: Convert Date to ISO string to match 'timestamp: string' type
  { id: 'e1', description: 'Fresh vegetables', amount: 55.20, timestamp: new Date(new Date().setHours(9, 0)).toISOString() },
  // FIX: Convert Date to ISO string to match 'timestamp: string' type
  { id: 'e2', description: 'Napkins', amount: 15.00, timestamp: new Date(new Date().setHours(10, 15)).toISOString() },
];

// FIX: Added missing 'salesTaxRate' property to conform to the Settings type.
const initialSettings: Settings = { businessName: 'Restaurant POS', salesTaxRate: 7.5 };

/**
 * Simulates fetching all initial data from an API.
 */
const fetchAllData = () => {
  return new Promise<{
    products: Product[];
    orders: Order[];
    expenses: Expense[];
    categories: string[];
    settings: Settings;
  }>(resolve => {
    setTimeout(() => {
      resolve({
        products: initialProducts,
        orders: initialOrders,
        expenses: initialExpenses,
        categories: initialCategories,
        settings: initialSettings,
      });
    }, 800); // 800ms delay to simulate network latency
  });
};

export const apiService = {
  fetchAllData,
};