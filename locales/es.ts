/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export const es = {
  // Header
  header_title: 'POS para Restaurante',
  header_logout_button: 'Cerrar Sesión',
  header_logout_confirm_title: 'Confirmar Cierre de Sesión',
  header_logout_confirm_message: '¿Estás seguro de que quieres cerrar la sesión?',
  header_role_admin: 'Admin',
  header_role_waiter: 'Mesero',
  header_role_kitchen: 'Cocina',

  // Bottom Nav
  nav_dashboard: 'Tablero',
  nav_products: 'Productos',
  nav_orders: 'Pedidos',
  nav_expenses: 'Gastos',
  nav_reports: 'Reportes',
  nav_settings: 'Ajustes',

  // Login
  login_title: 'Iniciar Sesión',
  login_username_placeholder: 'Nombre de usuario',
  login_password_placeholder: 'Contraseña',
  login_button: 'Ingresar',
  login_error_message: 'Usuario o contraseña inválidos.',

  // Dashboard
  dashboard_income: 'Ingresos Totales',
  dashboard_expenses: 'Gastos Totales',
  dashboard_profit: 'Ganancia Neta',
  dashboard_pending: 'Pedidos Pendientes',
  dashboard_welcome_title: '¡Bienvenido de Nuevo!',
  dashboard_welcome_message: 'Aquí está tu resumen diario. Puedes administrar tu restaurante usando la barra de navegación de abajo.',
  dashboard_completed_orders: 'Pedidos Completados',
  dashboard_cancelled_orders: 'Pedidos Cancelados',
  dashboard_avg_sale: 'Venta Promedio',
  dashboard_top_products: 'Productos Más Vendidos Hoy',
  dashboard_no_sales_yet: 'Aún no se han registrado ventas hoy.',
  dashboard_sold: 'vendidos',

  // Products
  products_title: 'Productos del Menú',
  products_add: 'Añadir Producto',
  products_add_category: 'Añadir Categoría',
  products_stock_status_in: 'En Stock',
  products_stock_status_out: 'Agotado',
  products_mark_in_stock: 'Marcar en Stock',
  products_mark_out_of_stock: 'Marcar como Agotado',

  // Orders
  orders_title: 'Gestionar Pedidos',
  orders_add: 'Nuevo Pedido',
  orders_pending: 'Pedidos Pendientes',
  orders_completed: 'Pedidos Completados',
  orders_cancelled: 'Pedidos Cancelados',
  orders_complete_button: 'Completar',
  orders_edit_button: 'Editar',
  orders_cancel_button: 'Cancelar',
  orders_no_pending: 'No hay pedidos pendientes.',
  orders_no_completed: 'No hay pedidos completados hoy.',
  orders_no_cancelled: 'No hay pedidos cancelados hoy.',
  orders_items: 'productos',
  orders_cancellation_reason: 'Motivo',

  // Expenses
  expenses_title: 'Registrar Gastos',
  expenses_add: 'Añadir Gasto',
  expenses_no_expenses: 'No hay gastos registrados hoy.',

  // Reports
  reports_title: 'Reporte de Caja Diario',
  reports_select_date: 'Seleccionar Fecha del Reporte',
  reports_income: 'Ingresos Totales por Ventas',
  reports_expenses: 'Gastos Totales',
  reports_profit: 'Ganancia Neta',

  // Settings
  settings_title: 'Ajustes de la Aplicación',
  settings_business_name_label: 'Nombre del Negocio',
  settings_business_name_placeholder: 'Introduce el nombre de tu negocio',
  settings_sales_tax_rate_label: 'Tasa de Impuestos (%)',
  settings_save_button: 'Guardar Ajustes',
  settings_users_title: 'Gestión de Usuarios',
  settings_add_user_button: 'Añadir Usuario',
  settings_delete_user_button: 'Eliminar',
  settings_delete_user_confirm_title: 'Confirmar Eliminación',
  settings_delete_user_confirm_message: '¿Estás seguro de que quieres eliminar al usuario {username}? Esta acción no se puede deshacer.',

  // Add Product Modal
  modal_add_product_title: 'Añadir Nuevo Producto',
  modal_add_product_name_placeholder: 'Nombre del Producto',
  modal_add_product_price_placeholder: 'Precio',
  modal_add_product_select_category: 'Selecciona una categoría',
  modal_add_product_in_stock_label: 'En stock por defecto',

  // Add Expense Modal
  modal_add_expense_title: 'Añadir Nuevo Gasto',
  modal_add_expense_desc_placeholder: 'Descripción del Gasto',
  modal_add_expense_amount_placeholder: 'Monto',
  
  // Add Category Modal
  modal_add_category_title: 'Añadir Nueva Categoría',
  modal_add_category_name_placeholder: 'Nombre de la Categoría (ej: Entrantes)',

  // Add User Modal
  modal_add_user_title: 'Añadir Nuevo Usuario',
  modal_add_user_username_placeholder: 'Nombre de usuario',
  modal_add_user_password_placeholder: 'Contraseña',
  modal_add_user_select_role: 'Selecciona un rol',

  // Add/Edit Order Modal
  modal_add_order_title: 'Crear Nuevo Pedido',
  modal_edit_order_title: 'Editar Pedido',
  modal_add_order_products: 'Productos Disponibles',
  modal_add_order_current: 'Pedido Actual',
  modal_add_order_no_items: 'Aún no hay productos añadidos.',
  modal_add_order_subtotal: 'Subtotal',
  modal_add_order_discount: 'Descuento',
  modal_add_order_tax: 'Impuesto',
  modal_add_order_grand_total: 'Total General',
  modal_add_order_notes_label: 'Notas / Observaciones',
  modal_add_order_notes_placeholder: 'ej: alergias, salsa extra...',
  modal_add_order_discount_type: 'Tipo de Descuento',
  modal_add_order_discount_value: 'Valor',
  
  // Cancel Order Modal
  modal_cancel_order_title: 'Cancelar Pedido',
  modal_cancel_order_reason_label: 'Motivo de la Cancelación',
  modal_cancel_order_reason_placeholder: 'ej: solicitud del cliente, producto no disponible...',

  // Forced Re-login Modal
  modal_critical_error_title: 'Error Crítico de la Aplicación',
  modal_critical_error_message: 'Ocurrió un error crítico y la aplicación no pudo recuperarse.\n\nPara proteger tus datos y asegurar la estabilidad, por favor cierra la sesión y vuelve a ingresar.',
  modal_critical_error_button: 'Cerrar Sesión y Reingresar',

  // Discount Types
  discount_type_none: 'Ninguno',
  discount_type_percentage: 'Porcentaje',
  discount_type_fixed: 'Monto Fijo',

  // Connection Status
  connection_status_connected: 'Conexión en tiempo real activa.',
  connection_status_reconnecting: 'Se perdió la conexión. Intentando reconectar...',
  connection_status_error: 'Falló la conexión. Los datos pueden estar desactualizados.',

  // Toast Notifications
  toast_product_created_success: "Producto creado con éxito.",
  toast_expense_added_success: "Gasto añadido con éxito.",
  toast_category_created_success: "Categoría creada con éxito.",
  toast_order_created_success: "Pedido creado con éxito.",
  toast_order_updated_success: "Pedido actualizado con éxito.",
  toast_order_completed_success: "Pedido marcado como completado.",
  toast_order_cancelled_success: "Pedido cancelado con éxito.",
  toast_settings_updated_success: "Ajustes guardados con éxito.",
  toast_stock_updated_success: "Estado del stock actualizado.",
  toast_user_created_success: "Usuario creado con éxito.",
  toast_user_created_error: "Error al crear el usuario.",
  toast_user_deleted_success: "Usuario eliminado con éxito.",
  toast_user_deleted_error: "Error al eliminar el usuario.",
  toast_order_complete_error: "Error al completar el pedido. Reviertiendo cambio.",
  toast_stock_update_error: "Error al actualizar el stock. Reviertiendo cambio.",
  toast_order_cancel_error: "Error al cancelar el pedido. Reviertiendo cambio.",
  toast_update_available_title: '¡Nueva versión disponible!',
  toast_update_available_message: 'Haz clic para recargar y obtener las últimas actualizaciones.',
  toast_update_available_button: 'Actualizar',

  // Generic mutation errors
  toast_product_created_error: "Error al crear el producto.",
  toast_expense_added_error: "Error al añadir el gasto.",
  toast_category_created_error: "Error al crear la categoría.",
  toast_order_created_error: "Error al crear el pedido.",
  toast_order_updated_error: "Error al actualizar el pedido.",
  toast_settings_updated_error: "Error al guardar los ajustes.",

  // Common
  common_cancel: 'Cancelar',
  common_add_product: 'Añadir Producto',
  common_add_expense: 'Añadir Gasto',
  common_add_category: 'Añadir Categoría',
  common_add_user: 'Añadir Usuario',
  common_save_order: 'Guardar Pedido',
  common_update_order: 'Actualizar Pedido',
  common_remove: 'Quitar',
  common_delete: 'Eliminar',
  common_confirm_cancellation: 'Confirmar Cancelación',
};