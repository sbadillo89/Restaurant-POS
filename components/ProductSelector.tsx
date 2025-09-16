/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { DashboardIcon, MenuIcon, OrdersIcon, ExpensesIcon, ReportsIcon, SettingsIcon } from './icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

type Page = 'dashboard' | 'products' | 'orders' | 'expenses' | 'reports' | 'settings';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const navItems: { page: Page; labelKey: any; icon: React.FC<{className?: string}> }[] = [
    { page: 'dashboard', labelKey: 'nav_dashboard', icon: DashboardIcon },
    { page: 'products', labelKey: 'nav_products', icon: MenuIcon },
    { page: 'orders', labelKey: 'nav_orders', icon: OrdersIcon },
    { page: 'expenses', labelKey: 'nav_expenses', icon: ExpensesIcon },
    { page: 'reports', labelKey: 'nav_reports', icon: ReportsIcon },
    { page: 'settings', labelKey: 'nav_settings', icon: SettingsIcon },
  ];

  const allowedRoutes = useMemo(() => {
    if (!currentUser) return [];
    switch (currentUser.role) {
      case 'admin':
        return ['dashboard', 'products', 'orders', 'expenses', 'reports', 'settings'];
      case 'waiter':
        return ['dashboard', 'products', 'orders'];
      case 'kitchen':
        return ['dashboard', 'orders'];
      default:
        return [];
    }
  }, [currentUser]);

  const visibleNavItems = navItems.filter(item => allowedRoutes.includes(item.page));


  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-40">
      <div className="max-w-4xl mx-auto flex justify-around">
        {visibleNavItems.map(({ page, labelKey, icon: Icon }) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
                isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium capitalize">{t(labelKey)}</span>
              {isActive && <div className="w-8 h-1 bg-blue-400 rounded-full mt-1"></div>}
            </button>
          )
        })}
      </div>
    </nav>
  );
};

export default BottomNav;