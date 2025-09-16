/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Import `keepPreviousData` from `@tanstack/react-query`.
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import type { DashboardStats } from '../types';

const defaultStats: DashboardStats = {
  income: 0,
  totalExpenses: 0,
  net: 0,
  pendingOrders: 0,
  completedOrdersCount: 0,
  cancelledOrdersCount: 0,
  averageOrderValue: 0,
  topSellingProducts: [],
};

/**
 * Custom hook to fetch dashboard statistics for a given date.
 * It handles caching and re-fetching automatically.
 * @param date The date for which to fetch statistics.
 */
export const useDashboardStats = (date: Date) => {
  // Format the date to 'YYYY-MM-DD' to use as a stable query key
  const dateString = date.toLocaleDateString('en-CA');

  const { data: stats = defaultStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats', dateString],
    queryFn: () => apiService.getDashboardStats(dateString),
    // Keep previous data while fetching new data for a smoother UX
    // FIX: In TanStack Query v5, `keepPreviousData: true` is replaced by `placeholderData: keepPreviousData`.
    placeholderData: keepPreviousData,
  });

  return {
    stats,
    isLoadingStats,
  };
};
