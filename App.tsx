/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useReducer, useEffect, useState } from 'react';
import { produce } from 'immer';
import Header from './components/Header';
import DashboardView from './components/StartScreen';
import ProductsView from './components/FilterPanel';
import OrdersView from './components/AdjustmentPanel';
import ExpensesView from './components/CropPanel';
import ReportsView from './components/Toolbar';
import SettingsView from './components/SettingsView';
import BottomNav from './components/ProductSelector';
import AddProductModal from './components/AddProductModal';
import AddExpenseModal from './components/ObjectCard';
import AddOrderModal from './components/AddOrderModal';
import AddCategoryModal from './components/AddCategoryModal';
import AddUserModal from './components/AddUserModal';
import CancelOrderModal from './components/CancelOrderModal';
import Spinner from './components/Spinner';
import type { 
  Order,
  CreateProductPayload, 
  CreateExpensePayload,
  CreateOrderPayload,
  EditOrderPayload,
  CreateCategoryPayload,
  CreateUserPayload,
  UpdateSettingsPayload,
  UpdateProductStockPayload,
  CancelOrderPayload,
  User,
  UserRole,
} from './types';
import { useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import ConfirmModal from './components/ConfirmModal';
import { useLanguage } from './context/LanguageContext';
import { useProducts } from './hooks/useProducts';
import { useOrders } from './hooks/useOrders';
import { useExpenses } from './hooks/useExpenses';
import { useCategories } from './hooks/useCategories';
import { useSettings } from './hooks/useSettings';
import { useUsers } from './hooks/useUsers';
import { useDashboardStats } from './hooks/useDashboardStats';
import { useServiceWorker } from './hooks/useServiceWorker';
import toast from 'react-hot-toast';
import { useRealtimeStatus } from './hooks/useRealtimeStatus';
import ConnectionStatusIndicator from './components/ConnectionStatusIndicator';

type Page = 'dashboard' | 'products' | 'orders' | 'expenses' | 'reports' | 'settings';

interface AppState {
  isProductModalOpen: boolean;
  isExpenseModalOpen: boolean;
  isOrderModalOpen: boolean;
  isCategoryModalOpen: boolean;
  isUserModalOpen: boolean;
  isCancelOrderModalOpen: boolean;
  isConfirmModalOpen: boolean;
  isLogoutConfirmOpen: boolean;
  reportDate: Date;
  orderToEdit: Order | null;
  orderToCancel: Order | null;
  userToDelete: User | null;
}

const initialState: AppState = {
  isProductModalOpen: false,
  isExpenseModalOpen: false,
  isOrderModalOpen: false,
  isCategoryModalOpen: false,
  isUserModalOpen: false,
  isCancelOrderModalOpen: false,
  isConfirmModalOpen: false,
  isLogoutConfirmOpen: false,
  reportDate: new Date(),
  orderToEdit: null,
  orderToCancel: null,
  userToDelete: null,
};

type AppAction =
  | { type: 'SET_REPORT_DATE'; payload: Date }
  | { type: 'OPEN_MODAL'; payload: 'product' | 'expense' | 'order' | 'category' | 'user' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'START_EDIT_ORDER', payload: Order }
  | { type: 'START_CANCEL_ORDER', payload: Order }
  | { type: 'START_DELETE_USER', payload: User }
  | { type: 'START_LOGOUT' }
  | { type: 'HANDLE_CRITICAL_ERROR' };

const appReducer = produce((draft: AppState, action: AppAction) => {
  switch (action.type) {
    case 'SET_REPORT_DATE':
      draft.reportDate = action.payload;
      break;
    case 'OPEN_MODAL':
      draft.isProductModalOpen = action.payload === 'product';
      draft.isExpenseModalOpen = action.payload === 'expense';
      draft.isOrderModalOpen = action.payload === 'order';
      draft.isCategoryModalOpen = action.payload === 'category';
      draft.isUserModalOpen = action.payload === 'user';
      draft.orderToEdit = null;
      draft.orderToCancel = null;
      draft.isCancelOrderModalOpen = false;
      break;
    case 'CLOSE_MODAL':
      draft.isProductModalOpen = false;
      draft.isExpenseModalOpen = false;
      draft.isOrderModalOpen = false;
      draft.isCategoryModalOpen = false;
      draft.isUserModalOpen = false;
      draft.isCancelOrderModalOpen = false;
      draft.isConfirmModalOpen = false;
      draft.isLogoutConfirmOpen = false;
      draft.orderToEdit = null;
      draft.orderToCancel = null;
      draft.userToDelete = null;
      break;
    case 'START_EDIT_ORDER':
      draft.orderToEdit = action.payload;
      draft.isOrderModalOpen = true;
      draft.orderToCancel = null;
      draft.isCancelOrderModalOpen = false;
      break;
    case 'START_CANCEL_ORDER':
      draft.orderToCancel = action.payload;
      draft.isCancelOrderModalOpen = true;
      draft.orderToEdit = null;
      draft.isOrderModalOpen = false;
      break;
    case 'START_DELETE_USER':
      draft.userToDelete = action.payload;
      draft.isConfirmModalOpen = true;
      break;
    case 'START_LOGOUT':
      draft.isLogoutConfirmOpen = true;
      break;
  }
});

const MainApp: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [hasCriticalError, setHasCriticalError] = useState(false);
  const { t } = useLanguage();
  const { currentUser, logout } = useAuth();
  const realtimeStatus = useRealtimeStatus();

  // --- DATA & MUTATION HOOKS ---
  const { products, isLoadingProducts, createProduct, isCreatingProduct, updateProductStock, updatingStockInfo } = useProducts();
  const { orders, isLoadingOrders, createOrder, isCreatingOrder, editOrder, isEditingOrder, completeOrder, completingOrderInfo, cancelOrder, isCancellingOrder } = useOrders();
  const { expenses, isLoadingExpenses, createExpense, isCreatingExpense } = useExpenses();
  const { categories, isLoadingCategories, createCategory, isCreatingCategory } = useCategories();
  const { settings, isLoadingSettings, updateSettings, isUpdatingSettings } = useSettings();
  const { users, isLoadingUsers, createUser, isCreatingUser, deleteUser, deletingUserInfo } = useUsers();
  const { stats: dailyStats, isLoadingStats } = useDashboardStats(state.reportDate);
  
  // --- APP STABILITY HOOKS ---
  useEffect(() => {
    if (realtimeStatus === 'error') {
      setHasCriticalError(true);
    }
  }, [realtimeStatus]);

  // --- EVENT HANDLERS ---
  const handleNavigate = (page: Page) => setCurrentPage(page);
  const handleOpenModal = (modal: 'product' | 'expense' | 'order' | 'category' | 'user') => dispatch({ type: 'OPEN_MODAL', payload: modal });
  const handleCloseModal = () => dispatch({ type: 'CLOSE_MODAL' });
  const handleStartEditOrder = (order: Order) => dispatch({ type: 'START_EDIT_ORDER', payload: order });
  const handleStartCancelOrder = (order: Order) => dispatch({ type: 'START_CANCEL_ORDER', payload: order });
  const handleStartDeleteUser = (user: User) => dispatch({ type: 'START_DELETE_USER', payload: user });
  const handleStartLogout = () => dispatch({ type: 'START_LOGOUT' });

  // --- MUTATION HANDLERS (wrapping mutations with modal logic) ---
  const handleAddProduct = (payload: CreateProductPayload) => createProduct(payload, { onSettled: handleCloseModal });
  const handleAddExpense = (payload: CreateExpensePayload) => createExpense(payload, { onSettled: handleCloseModal });
  const handleAddCategory = (payload: CreateCategoryPayload) => createCategory(payload, { onSettled: handleCloseModal });
  const handleSaveOrder = (payload: CreateOrderPayload) => createOrder(payload, { onSettled: handleCloseModal });
  const handleUpdateOrder = (payload: EditOrderPayload) => editOrder(payload, { onSettled: handleCloseModal });
  const handleAddUser = (payload: CreateUserPayload) => createUser(payload, { onSettled: handleCloseModal });

  const handleConfirmDeleteUser = () => {
    if (state.userToDelete) {
      deleteUser(state.userToDelete.id);
      handleCloseModal();
    }
  };
  const handleConfirmCancellation = (payload: CancelOrderPayload) => {
    cancelOrder(payload);
    handleCloseModal();
  };
  
  const handleCompleteOrder = (orderId: string) => completeOrder(orderId);
  const handleSettingsChange = (payload: UpdateSettingsPayload) => updateSettings(payload);
  const handleUpdateStock = (payload: UpdateProductStockPayload) => updateProductStock(payload);

  const renderCurrentPage = () => {
    const userRole = currentUser?.role as UserRole;
    const allowedRoutesForRole: Record<UserRole, Page[]> = {
      admin: ['dashboard', 'products', 'orders', 'expenses', 'reports', 'settings'],
      waiter: ['dashboard', 'products', 'orders'],
      kitchen: ['dashboard', 'orders'],
    };

    if (!userRole || !allowedRoutesForRole[userRole]?.includes(currentPage)) {
      // Default to dashboard if role is invalid or page is not allowed
      return <DashboardView stats={dailyStats} isLoading={isLoadingStats} />;
    }

    switch (currentPage) {
      case 'dashboard': return <DashboardView stats={dailyStats} isLoading={isLoadingStats} />;
      case 'products': return <ProductsView products={products} categories={categories} isLoading={isLoadingProducts || isLoadingCategories} onAddProduct={() => handleOpenModal('product')} onAddCategory={() => handleOpenModal('category')} onUpdateStock={handleUpdateStock} updatingStock={updatingStockInfo} />;
      case 'orders': return <OrdersView orders={orders} isLoading={isLoadingOrders} onAddOrder={() => handleOpenModal('order')} onCompleteOrder={handleCompleteOrder} onEditOrder={handleStartEditOrder} onCancelOrder={handleStartCancelOrder} completingOrder={completingOrderInfo} />;
      case 'expenses': return <ExpensesView expenses={expenses} isLoading={isLoadingExpenses} onAddExpense={() => handleOpenModal('expense')} />;
      case 'reports': return <ReportsView stats={dailyStats} isLoading={isLoadingStats} selectedDate={state.reportDate} onDateChange={(date) => dispatch({ type: 'SET_REPORT_DATE', payload: date })} />;
      case 'settings': return <SettingsView settings={settings} isLoading={isLoadingSettings || isLoadingUsers} onSettingsChange={handleSettingsChange} users={users} onAddUser={() => handleOpenModal('user')} onDeleteUser={handleStartDeleteUser} isSavingSettings={isUpdatingSettings} deletingUser={deletingUserInfo} />;
      default: return <DashboardView stats={dailyStats} isLoading={isLoadingStats} />;
    }
  };
  

  return (
    <>
      <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col">
        <Header 
          businessName={settings.businessName} 
          onLogoutRequest={handleStartLogout}
          currentPage={currentPage}
        />
        <main className="flex-grow p-4 sm:p-6 pb-24 overflow-y-auto">
          {renderCurrentPage()}
        </main>
        <BottomNav 
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
        <ConnectionStatusIndicator status={realtimeStatus} />
      </div>

      {state.isProductModalOpen && <AddProductModal onClose={handleCloseModal} onAddProduct={handleAddProduct} categories={categories} isSubmitting={isCreatingProduct} />}
      {state.isExpenseModalOpen && <AddExpenseModal onClose={handleCloseModal} onAddExpense={handleAddExpense} isSubmitting={isCreatingExpense} />}
      {state.isOrderModalOpen && <AddOrderModal onClose={handleCloseModal} onSaveOrder={handleSaveOrder} onUpdateOrder={handleUpdateOrder} orderToEdit={state.orderToEdit} products={products} categories={categories} settings={settings} isSubmitting={isCreatingOrder || isEditingOrder} />}
      {state.isCategoryModalOpen && <AddCategoryModal onClose={handleCloseModal} onAddCategory={handleAddCategory} isSubmitting={isCreatingCategory} />}
      {state.isUserModalOpen && <AddUserModal onClose={handleCloseModal} onAddUser={handleAddUser} isSubmitting={isCreatingUser} />}
      {state.isCancelOrderModalOpen && state.orderToCancel && <CancelOrderModal onClose={handleCloseModal} onConfirm={handleConfirmCancellation} order={state.orderToCancel} isSubmitting={isCancellingOrder} />}
      {state.isConfirmModalOpen && state.userToDelete && (
        <ConfirmModal 
            onClose={handleCloseModal}
            onConfirm={handleConfirmDeleteUser}
            title={t('settings_delete_user_confirm_title')}
            message={t('settings_delete_user_confirm_message').replace('{username}', state.userToDelete.username)}
            isSubmitting={deletingUserInfo.isPending}
        />
      )}
      {state.isLogoutConfirmOpen && (
        <ConfirmModal
          onClose={handleCloseModal}
          onConfirm={logout}
          title={t('header_logout_confirm_title')}
          message={t('header_logout_confirm_message')}
          confirmButtonText={t('header_logout_button')}
        />
      )}
       {hasCriticalError && (
        <ConfirmModal
          onClose={() => {}} // This modal cannot be closed by normal means
          onConfirm={logout}
          title={t('modal_critical_error_title')}
          message={t('modal_critical_error_message')}
          confirmButtonText={t('modal_critical_error_button')}
          confirmButtonColor="bg-blue-600 hover:bg-blue-500"
          hideCancelButton={true}
          disableOverlayClose={true}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const { t } = useLanguage();
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (isUpdateAvailable) {
      toast.custom(
        (toastInstance) => (
          <div
            className={`max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-700 animate-fade-in`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    {t('toast_update_available_title')}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    {t('toast_update_available_message')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-700">
              <button
                onClick={() => {
                  updateServiceWorker();
                  toast.dismiss(toastInstance.id);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-500 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('toast_update_available_button')}
              </button>
            </div>
          </div>
        ),
        {
          id: 'app-update-toast',
          duration: Infinity, // Keep the toast visible until the user interacts with it
        }
      );
    }
  }, [isUpdateAvailable, updateServiceWorker, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return currentUser ? <MainApp /> : <LoginView />;
};

export default App;
