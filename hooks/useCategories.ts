/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import type { CreateCategoryPayload } from '../types';

export const useCategories = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({ 
    queryKey: ['categories'], 
    queryFn: apiService.getCategories,
    enabled: !!currentUser && (currentUser.role === 'admin' || currentUser.role === 'waiter'),
  });

  // --- REALTIME SUBSCRIPTION ---
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'waiter')) {
      return;
    }
    
    // FIX: Updated to the new Supabase V2 Realtime subscription syntax.
    // The previous syntax `supabase.from().on()` is deprecated.
    const channel = supabase
      .channel('public:categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        console.log('Realtime change received for categories!', payload);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to categories changes.');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to categories changes:', err);
        }
      });

    return () => {
      // FIX: Updated to the new Supabase V2 subscription cleanup method.
      // `removeSubscription` is deprecated; `removeChannel` is now used.
      supabase.removeChannel(channel);
    };
  }, [queryClient, currentUser]);

  const { mutate: createCategory, isPending: isCreatingCategory } = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => apiService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('toast_category_created_success'));
    },
    onError: () => {
      toast.error(t('toast_category_created_error'));
    },
  });

  return {
    categories,
    isLoadingCategories,
    createCategory,
    isCreatingCategory,
  };
};
