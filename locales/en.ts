/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export const en = {
  // Header
  header_title: 'Restaurant POS',
  header_logout_button: 'Logout',
  header_logout_confirm_title: 'Confirm Logout',
  header_logout_confirm_message: 'Are you sure you want to log out?',
  header_role_admin: 'Admin',
  header_role_waiter: 'Waiter',
  header_role_kitchen: 'Kitchen',

  // Bottom Nav
  nav_dashboard: 'Dashboard',
  nav_products: 'Products',
  nav_orders: 'Orders',
  nav_expenses: 'Expenses',
  nav_reports: 'Reports',
  nav_settings: 'Settings',

  // Login
  login_title: 'Login',
  login_username_placeholder: 'Username',
  login_password_placeholder: 'Password',
  login_button: 'Login',
  login_error_message: 'Invalid username or password.',

  // Dashboard
  dashboard_income: 'Total Income',
  dashboard_expenses: 'Total Expenses',
  dashboard_profit: 'Net Profit',
  dashboard_pending: 'Pending Orders',
  dashboard_welcome_title: 'Welcome Back!',
  dashboard_welcome_message: "Here's your daily summary. You can manage your restaurant using the navigation bar below.",
  dashboard_completed_orders: 'Completed Orders',
  dashboard_cancelled_orders: 'Cancelled Orders',
  dashboard_avg_sale: 'Average Sale',
  dashboard_top_products: 'Top Selling Products Today',
  dashboard_no_sales_yet: 'No sales recorded yet today.',
  dashboard_sold: 'sold',
  
  // Products
  products_title: 'Menu Products',
  products_add: 'Add Product',
  products_add_category: 'Add Category',
  products_stock_status_in: 'In Stock',
  products_stock_status_out: 'Out of Stock',
  products_mark_in_stock: 'Mark as In Stock',
  products_mark_out_of_stock: 'Mark as Out of Stock',
  
  // Orders
  orders_title: 'Manage Orders',
  orders_add: 'New Order',
  orders_pending: 'Pending Orders',
  orders_completed: 'Completed Orders',
  orders_cancelled: 'Cancelled Orders',
  orders_complete_button: 'Complete',
  orders_edit_button: 'Edit',
  orders_cancel_button: 'Cancel',
  orders_no_pending: 'No pending orders.',
  orders_no_completed: 'No completed orders today.',
  orders_no_cancelled: 'No cancelled orders today.',
  orders_items: 'items',
  orders_cancellation_reason: 'Reason',
  
  // Expenses
  expenses_title: 'Log Expenses',
  expenses_add: 'Add Expense',
  expenses_no_expenses: 'No expenses logged today.',
  
  // Reports
  reports_title: 'Daily Cash Report',
  reports_select_date: 'Select Report Date',
  reports_income: 'Total Income from Sales',
  reports_expenses: 'Total Expenses',
  reports_profit: 'Net Profit',

  // Settings
  settings_title: 'Application Settings',
  settings_business_name_label: 'Business Name',
  settings_business_name_placeholder: 'Enter your business name',
  settings_sales_tax_rate_label: 'Sales Tax Rate (%)',
  settings_save_button: 'Save Settings',
  settings_users_title: 'User Management',
  settings_add_user_button: 'Add User',
  settings_delete_user_button: 'Delete',
  settings_delete_user_confirm_title: 'Confirm Deletion',
  settings_delete_user_confirm_message: 'Are you sure you want to delete user {username}? This action cannot be undone.',

  // Add Product Modal
  modal_add_product_title: 'Add New Product',
  modal_add_product_name_placeholder: 'Product Name',
  modal_add_product_price_placeholder: 'Price',
  modal_add_product_select_category: 'Select a category',
  modal_add_product_in_stock_label: 'In stock by default',
  
  // Add Expense Modal
  modal_add_expense_title: 'Add New Expense',
  modal_add_expense_desc_placeholder: 'Expense Description',
  modal_add_expense_amount_placeholder: 'Amount',

  // Add Category Modal
  modal_add_category_title: 'Add New Category',
  modal_add_category_name_placeholder: 'Category Name (e.g., Appetizers)',

  // Add User Modal
  modal_add_user_title: 'Add New User',
  modal_add_user_username_placeholder: 'Username',
  modal_add_user_password_placeholder: 'Password',
  modal_add_user_select_role: 'Select a role',
  
  // Add/Edit Order Modal
  modal_add_order_title: 'Create New Order',
  modal_edit_order_title: 'Edit Order',
  modal_add_order_products: 'Available Products',
  modal_add_order_current: 'Current Order',
  modal_add_order_no_items: 'No items added yet.',
  modal_add_order_subtotal: 'Subtotal',
  modal_add_order_discount: 'Discount',
  modal_add_order_tax: 'Tax',
  modal_add_order_grand_total: 'Grand Total',
  modal_add_order_notes_label: 'Notes / Observations',
  modal_add_order_notes_placeholder: 'e.g., allergy info, extra sauce...',
  modal_add_order_discount_type: 'Discount Type',
  modal_add_order_discount_value: 'Value',

  // Cancel Order Modal
  modal_cancel_order_title: 'Cancel Order',
  modal_cancel_order_reason_label: 'Reason for Cancellation',
  modal_cancel_order_reason_placeholder: 'e.g., customer request, item unavailable...',

  // Forced Re-login Modal
  modal_critical_error_title: 'Application Error',
  modal_critical_error_message: 'A critical error occurred and the application could not recover.\n\nTo protect your data and ensure stability, please log out and sign back in.',
  modal_critical_error_button: 'Log Out and Re-enter',

  // Discount Types
  discount_type_none: 'None',
  discount_type_percentage: 'Percentage',
  discount_type_fixed: 'Fixed Amount',

  // Connection Status
  connection_status_connected: 'Real-time connection active.',
  connection_status_reconnecting: 'Connection lost. Attempting to reconnect...',
  connection_status_error: 'Connection failed. Data may be outdated.',

  // Toast Notifications
  toast_product_created_success: "Product created successfully.",
  toast_expense_added_success: "Expense added successfully.",
  toast_category_created_success: "Category created successfully.",
  toast_order_created_success: "Order created successfully.",
  toast_order_updated_success: "Order updated successfully.",
  toast_order_completed_success: "Order marked as complete.",
  toast_order_cancelled_success: "Order cancelled successfully.",
  toast_settings_updated_success: "Settings saved successfully.",
  toast_stock_updated_success: "Stock status updated.",
  toast_user_created_success: "User created successfully.",
  toast_user_created_error: "Failed to create user.",
  toast_user_deleted_success: "User deleted successfully.",
  toast_user_deleted_error: "Failed to delete user.",
  toast_order_complete_error: "Failed to complete order. Reverting change.",
  toast_stock_update_error: "Failed to update stock. Reverting change.",
  toast_order_cancel_error: "Failed to cancel order. Reverting change.",
  toast_update_available_title: 'New version available!',
  toast_update_available_message: 'Click to reload and get the latest updates.',
  toast_update_available_button: 'Update',

  // Generic mutation errors
  toast_product_created_error: "Failed to create product.",
  toast_expense_added_error: "Failed to add expense.",
  toast_category_created_error: "Failed to create category.",
  toast_order_created_error: "Failed to create order.",
  toast_order_updated_error: "Failed to update order.",
  toast_settings_updated_error: "Failed to save settings.",

  // Common
  common_cancel: 'Cancel',
  common_add_product: 'Add Product',
  common_add_expense: 'Add Expense',
  common_add_category: 'Add Category',
  common_add_user: 'Add User',
  common_save_order: 'Save Order',
  common_update_order: 'Update Order',
  common_remove: 'Remove',
  common_delete: 'Delete',
  common_confirm_cancellation: 'Confirm Cancellation',
};