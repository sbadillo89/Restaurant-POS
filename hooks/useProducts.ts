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
import type { Product, CreateProductPayload, UpdateProductStockPayload } from '../types';

export const useProducts = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({ 
    queryKey: ['products'], 
    queryFn: apiService.getProducts,
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
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Realtime change received for products!', payload);
        queryClient.invalidateQueries({ queryKey: ['products'] });
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to products changes.');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to products changes:', err);
        }
      });

    return () => {
      // FIX: Updated to the new Supabase V2 subscription cleanup method.
      // `removeSubscription` is deprecated; `removeChannel` is now used.
      supabase.removeChannel(channel);
    };
  }, [queryClient, currentUser]);

  const { mutate: createProduct, isPending: isCreatingProduct } = useMutation<Product, Error, CreateProductPayload>({
    mutationFn: apiService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('toast_product_created_success'));
    },
    onError: () => {
      toast.error(t('toast_product_created_error'));
    },
  });

  const { mutate: updateProductStock, isPending: isUpdatingStock, variables: updatingStockVariables } = useMutation<Product, Error, UpdateProductStockPayload, { previousProducts: Product[] | undefined }>({
    mutationFn: apiService.updateProductStock,
    onMutate: async (payload: UpdateProductStockPayload) => {
      await queryClient.cancelQueries({ queryKey: ['products']});
      const previousProducts = queryClient.getQueryData<Product[]>(['products']);
      queryClient.setQueryData<Product[]>(['products'], old => 
        old?.map(p => p.id === payload.productId ? {...p, inStock: payload.inStock} : p) ?? []
      );
      return { previousProducts };
    },
    onError: (err, payload, context) => {
      if(context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      toast.error(t('toast_stock_update_error'));
    },
    onSuccess: () => {
      toast.success(t('toast_stock_updated_success'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products']});
    },
  });

  return {
    products,
    isLoadingProducts,
    createProduct,
    isCreatingProduct,
    updateProductStock,
    updatingStockInfo: {
      isPending: isUpdatingStock,
      productId: updatingStockVariables?.productId ?? null
    },
  };
};
