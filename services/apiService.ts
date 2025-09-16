/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { supabase } from './supabaseClient';
import type { 
  Product, 
  Order, 
  Expense, 
  Settings,
  CreateProductPayload,
  CreateExpensePayload,
  CreateOrderPayload,
  EditOrderPayload,
  CreateCategoryPayload,
  UpdateOrderPayload,
  UpdateSettingsPayload,
  UpdateProductStockPayload,
  CancelOrderPayload,
  User,
  CreateUserPayload,
  Category,
  OrderItem,
  DashboardStats,
} from '../types';
import { getUtcDayRange } from '../utils/date';

// --- HELPER for error handling ---
const handleApiError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error);
  throw new Error(error.message || `An unknown error occurred in ${context}.`);
};

// --- DATA TRANSFORMATION HELPERS ---
const transformSupabaseProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: p.price,
  // Supabase returns related fields as an object or array of objects.
  category: Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name || 'Uncategorized',
  inStock: p.in_stock,
});

const transformSupabaseOrder = (o: any): Order => ({
  id: o.id,
  // The join brings back products inside order_items
  items: o.order_items.map((item: any) => ({
    productId: item.product_id,
    name: item.products.name,
    quantity: item.quantity,
    priceAtOrder: item.price_at_order,
  })),
  subtotal: o.subtotal,
  discountType: o.discount_type,
  discountValue: o.discount_value,
  taxAmount: o.tax_amount,
  total: o.total,
  status: o.status,
  timestamp: o.created_at,
  updated_at: o.updated_at || undefined,
  note: o.note || undefined,
  cancellationNote: o.cancellation_note || undefined,
});

// --- API FUNCTIONS ---

// READ
const getDashboardStats = async (date: string): Promise<DashboardStats> => {
  // Get the timezone offset in minutes from the client's browser.
  // This value is positive for timezones behind UTC (e.g., 300 for UTC-5)
  // and negative for timezones ahead of UTC (e.g., -120 for UTC+2).
  const timezoneOffset = new Date().getTimezoneOffset();
  const { data, error } = await supabase.functions.invoke('get-dashboard-stats', {
    body: { date, timezoneOffset },
  });
  if (error) handleApiError(error, 'getDashboardStats');
  return data;
};

const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`*, categories (name)`)
    .order('name', { ascending: true });
    
  if (error) handleApiError(error, 'getProducts');
  return data?.map(transformSupabaseProduct) ?? [];
};

const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))')
    .order('created_at', { ascending: false });
    
  if (error) handleApiError(error, 'getOrders');
  return data?.map(transformSupabaseOrder) ?? [];
};

const getExpenses = async (): Promise<Expense[]> => {
  const { startUtc, endUtc } = getUtcDayRange();   

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('created_at', startUtc)
    .lt('created_at', endUtc)
    .order('created_at', { ascending: false });

  if (error) handleApiError(error, 'getExpenses');

  return (
    data?.map(e => ({
      ...e,
      timestamp: e.created_at,
    })) ?? []
  ) as Expense[];
};

const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) handleApiError(error, 'getCategories');
  return data ?? [];
};

const getSettings = async (): Promise<Settings> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('business_name, sales_tax_rate')
    .eq('id', 1)
    .single();
  if (error) handleApiError(error, 'getSettings');
  return {
    businessName: data?.business_name || 'Restaurant POS',
    salesTaxRate: data?.sales_tax_rate || 0,
  };
};

const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('profiles').select('id, username, role');
  if (error) handleApiError(error, 'getUsers');
  return data as User[] ?? [];
};

// AUTH
const login = async (username: string, password: string): Promise<User> => {
  // Supabase uses email to login, we'll use a dummy email format
  const email = `${username.toLowerCase()}@maildrop.cc`;
  const { data: { user: authUser }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError || !authUser) handleApiError(signInError, 'login:signIn');
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', authUser.id)
    .single();
  
  if (profileError || !profile) handleApiError(profileError, 'login:fetchProfile');
  return profile as User;
};

// CREATE
const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const { data, error } = await supabase.from('products').insert(payload).select().single();
  if (error) handleApiError(error, 'createProduct');
  return data as Product;
};

const createExpense = async (payload: CreateExpensePayload): Promise<Expense> => {
  const { data, error } = await supabase.from('expenses').insert(payload).select().single();
  if (error) handleApiError(error, 'createExpense');
  return { ...data, timestamp: data.created_at } as Expense;
};

const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  const { data, error } = await supabase.from('categories').insert(payload).select().single();
  if (error) handleApiError(error, 'createCategory');
  return data as Category;
};

const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  // Calculate totals before inserting
  const subtotal = payload.items.reduce((sum, item) => sum + (item.priceAtOrder * item.quantity), 0);
  const { discountType, discountValue } = payload;
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = subtotal * ((discountValue || 0) / 100);
  } else if (discountType === 'fixed') {
    discountAmount = discountValue || 0;
  }
  discountAmount = Math.min(subtotal, discountAmount);
  
  const settings = await getSettings();
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (settings.salesTaxRate / 100);
  const total = taxableAmount + taxAmount;
  const now = new Date().toISOString();

  // Step 1: Insert the main order record
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      subtotal,
      discount_type: discountType,
      discount_value: discountValue || 0,
      tax_amount: taxAmount,
      total,
      note: payload.note,
      status: 'pending',
      created_at: now, // Critical fix: Ensure created_at is set explicitly
      updated_at: now, 
    })
    .select('id')
    .single();

  if (orderError || !newOrder) handleApiError(orderError || new Error('Order creation failed to return an ID.'), 'createOrder:insertOrder');
  
  // Step 2: Insert the associated order items
  if (payload.items.length > 0) {
    const orderItems = payload.items.map(item => ({
      order_id: newOrder.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_order: item.priceAtOrder,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) handleApiError(itemsError, 'createOrder:insertItems');
  }

  // Step 3: Fetch the complete, newly created order with all relations to ensure data consistency
  const { data: completeOrderData, error: fetchError } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))')
    .eq('id', newOrder.id)
    .single();
  
  if (fetchError) handleApiError(fetchError, 'createOrder:fetchAfterInsert');

  // Step 4: Transform and return the consistent data structure
  return transformSupabaseOrder(completeOrderData);
};


const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: payload,
  });

  if (error) {
    handleApiError(error, 'createUser:invoke');
  }

  // Handle errors returned from within the function's logic.
  if (data?.error) {
    console.error('Error from create-user function:', data.error, data.details);
    const errorMessage = data.error as string;
    
    // Create a more user-friendly error message for common DB errors.
    if (errorMessage.includes('duplicate key value') && errorMessage.includes('profiles_username_key')) {
      throw new Error('Username already exists. Please choose another.');
    }
    throw new Error('An error occurred while creating the user.');
  }
  
  const createdUser = data?.user;
  if (!createdUser?.id || !createdUser?.user_metadata?.username || !createdUser?.user_metadata?.role) {
    throw new Error('User creation API returned invalid data.');
  }

  return {
    id: createdUser.id,
    username: createdUser.user_metadata.username,
    role: createdUser.user_metadata.role,
  };
};

// UPDATE
const updateOrder = async (payload: UpdateOrderPayload): Promise<Order> => {
  // Step 1: Perform the update.
  const { error: updateError } = await supabase
    .from('orders')
    .update(payload.updates)
    .eq('id', payload.orderId);
    
  if (updateError) handleApiError(updateError, 'updateOrder:update');

  // Step 2: After the update, fetch the complete order data with all its relations.
  // This ensures we return a full, consistent object to react-query, preventing cache corruption.
  const { data: updatedOrderData, error: fetchError } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))') // The crucial join
    .eq('id', payload.orderId)
    .single();

  if (fetchError) handleApiError(fetchError, 'updateOrder:fetch');
  
  // Step 3: Transform the fetched data into the correct shape before returning.
  return transformSupabaseOrder(updatedOrderData);
};

const updateProductStock = async (payload: UpdateProductStockPayload): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update({ in_stock: payload.inStock })
    .eq('id', payload.productId)
    .select()
    .single();
  if (error) handleApiError(error, 'updateProductStock');
  return data as Product;
};

const editOrder = async (payload: EditOrderPayload): Promise<void> => {
    const { orderId, items, note, discountType, discountValue } = payload;

    // Always recalculate totals and update the main order record.
    const subtotal = items.reduce((sum, item) => sum + (item.priceAtOrder * item.quantity), 0);
    let discountAmount = 0;
    if (discountType === 'percentage') {
        discountAmount = subtotal * ((discountValue || 0) / 100);
    } else if (discountType === 'fixed') {
        discountAmount = discountValue || 0;
    }
    discountAmount = Math.min(subtotal, Math.max(0, discountAmount));
    
    const settings = await getSettings();
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (settings.salesTaxRate / 100);
    const total = taxableAmount + taxAmount;
    
    const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
            subtotal,
            total,
            tax_amount: taxAmount,
            discount_type: discountType,
            discount_value: discountValue,
            note,
            updated_at: new Date().toISOString(), // Critical fix: ensure edits update the timestamp
        })
        .eq('id', orderId);

    if (orderUpdateError) handleApiError(orderUpdateError, 'editOrder:updateOrder');

    // To prevent bugs with item duplication or inconsistent state, we use a robust
    // "delete-then-insert" strategy. This ensures the items in the database
    // always exactly match the items from the user's edit session.

    // 1. Delete all existing items for this order.
    const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

    if (deleteError) handleApiError(deleteError, 'editOrder:deleteItems');

    // 2. Insert the new, updated set of items.
    if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
            order_id: orderId,
            product_id: item.productId,
            quantity: item.quantity,
            price_at_order: item.priceAtOrder,
        }));
        
        const { error: insertError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

        if (insertError) handleApiError(insertError, 'editOrder:insertItems');
    }
};

const updateSettings = async (payload: UpdateSettingsPayload): Promise<Settings> => {
  const updates = {
    business_name: payload.businessName,
    sales_tax_rate: payload.salesTaxRate,
  };
  const { data, error } = await supabase
    .from('app_settings')
    .update(updates)
    .eq('id', 1)
    .select()
    .single();
  if (error) handleApiError(error, 'updateSettings');
  return {
    businessName: data.business_name,
    salesTaxRate: data.sales_tax_rate,
  };
};

// DELETE
const deleteUser = async (userId: string): Promise<void> => {
  // To securely delete a user, we invoke a Supabase Edge Function.
  // The supabase-js client automatically stringifies the body.
  const { error } = await supabase.functions.invoke('delete-user', {
    body: { userId },
  });
  if (error) handleApiError(error, 'deleteUser');
};

export const apiService = {
  getDashboardStats,
  getProducts,
  getOrders,
  getExpenses,
  getCategories,
  getSettings,
  getUsers,
  login,
  createProduct,
  createExpense,
  createCategory,
  createOrder,
  createUser,
  updateOrder,
  editOrder,
  updateSettings,
  updateProductStock,
  deleteUser,
};