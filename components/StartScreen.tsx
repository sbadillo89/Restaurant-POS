/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, XCircleIcon, StarIcon, ClockIcon } from './icons';
import Spinner from './Spinner';

interface DashboardProps {
  stats: {
    income: number;
    totalExpenses: number;
    pendingOrders: number;
    net: number;
    completedOrdersCount: number;
    cancelledOrdersCount: number;
    averageOrderValue: number;
    topSellingProducts: { name: string; quantity: number }[];
  };
  isLoading: boolean;
}

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
    <h3 className="text-lg font-medium text-gray-400">{title}</h3>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

// New component for smaller stat cards
const SmallStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center gap-4">
    {icon}
    <div>
      <h4 className="font-medium text-gray-400">{title}</h4>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const DashboardView: React.FC<DashboardProps> = ({ stats, isLoading }) => {
  const { t, formatCurrency } = useLanguage();
  const { currentUser } = useAuth();

  const isKitchen = currentUser?.role === 'kitchen';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Main stats grid */}
      <div className={`grid grid-cols-1 ${isKitchen ? '' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-4 md:gap-6`}>
        {!isKitchen ? (
          <>
            <StatCard title={t('dashboard_income')} value={`$${formatCurrency(stats.income)}`} color="text-green-400" />
            <StatCard title={t('dashboard_expenses')} value={`$${formatCurrency(stats.totalExpenses)}`} color="text-red-400" />
            <StatCard title={t('dashboard_profit')} value={`$${formatCurrency(stats.net)}`} color={stats.net >= 0 ? "text-blue-400" : "text-red-400"} />
            <StatCard title={t('dashboard_avg_sale')} value={`$${formatCurrency(stats.averageOrderValue)}`} color="text-blue-500" />
          </>
        ) : (
          <StatCard title={t('dashboard_pending')} value={stats.pendingOrders.toString()} color="text-yellow-400" />
        )}
      </div>

      {/* Secondary stats and top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Secondary Stats */}
        {!isKitchen && (
          <div className="lg:col-span-1 flex flex-col gap-4">
            <SmallStatCard 
              title={t('dashboard_completed_orders')} 
              value={stats.completedOrdersCount.toString()} 
              icon={<CheckCircleIcon className="w-10 h-10 text-green-500" />} 
            />
            <SmallStatCard 
              title={t('dashboard_cancelled_orders')} 
              value={stats.cancelledOrdersCount.toString()} 
              icon={<XCircleIcon className="w-10 h-10 text-red-500" />} 
            />
            <SmallStatCard 
              title={t('dashboard_pending')} 
              value={stats.pendingOrders.toString()} 
              icon={<ClockIcon className="w-10 h-10 text-yellow-500" />} 
            />
          </div>
        )}

        {/* Top Products */}
        <div className={`bg-gray-800 p-6 rounded-lg border border-gray-700 ${isKitchen ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <div className="flex items-center gap-3 mb-4">
            <StarIcon className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">{t('dashboard_top_products')}</h2>
          </div>
          {stats.topSellingProducts.length > 0 ? (
            <ul className="space-y-3">
              {stats.topSellingProducts.map((product, index) => (
                <li key={product.name} className="flex items-center justify-between text-lg p-3 bg-gray-700/50 rounded-md">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-400">{index + 1}.</span>
                    <span className="font-medium text-gray-200">{product.name}</span>
                  </div>
                  <span className="font-bold text-white bg-blue-600 px-3 py-1 rounded-full text-sm">{product.quantity} {t('dashboard_sold')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('dashboard_no_sales_yet')}</p>
          )}
        </div>
      </div>
      
      {/* Welcome Message */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">{t('dashboard_welcome_title')}</h2>
          <p className="text-gray-400">{t('dashboard_welcome_message')}</p>
      </div>
    </div>
  );
};

export default DashboardView;