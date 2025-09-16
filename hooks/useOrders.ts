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
import type { Order, CreateOrderPayload, EditOrderPayload, CancelOrderPayload } from '../types';

export const useOrders = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
        queryKey: ['orders'],
        queryFn: apiService.getOrders,
    });

    // --- REALTIME SUBSCRIPTION ---
    useEffect(() => {
        const handleDbChange = (tableName: string) => (payload: any) => {
            console.log(`Realtime change received for ${tableName}!`, payload);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        };

        // FIX: Updated to the new Supabase V2 Realtime subscription syntax.
        // The previous syntax `supabase.from().on()` is deprecated.
        const ordersChannel = supabase
            .channel('public:orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, handleDbChange('orders'))
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') console.log('Successfully subscribed to orders changes.');
                if (status === 'CHANNEL_ERROR') console.error('Failed to subscribe to orders changes:', err);
            });

        // FIX: Updated to the new Supabase V2 Realtime subscription syntax.
        const orderItemsChannel = supabase
            .channel('public:order_items')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, handleDbChange('order_items'))
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') console.log('Successfully subscribed to order_items changes.');
                if (status === 'CHANNEL_ERROR') console.error('Failed to subscribe to order_items changes:', err);
            });

        return () => {
            // FIX: Updated to the new Supabase V2 subscription cleanup method.
            // `removeSubscription` is deprecated; `removeChannel` is now used.
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(orderItemsChannel);
        };
    }, [queryClient]);

    const { mutate: createOrder, isPending: isCreatingOrder } = useMutation({
        mutationFn: (payload: CreateOrderPayload) => apiService.createOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            toast.success(t('toast_order_created_success'));
        },
        onError: () => {
            toast.error(t('toast_order_created_error'));
        },
    });

    const { mutate: editOrder, isPending: isEditingOrder } = useMutation({
        mutationFn: (payload: EditOrderPayload) => apiService.editOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            toast.success(t('toast_order_updated_success'));
        },
        onError: () => {
            toast.error(t('toast_order_updated_error'));
        },
    });

    const { mutate: completeOrder, isPending: isCompletingOrder, variables: completingOrderVariables } = useMutation<Order, Error, string, { previousOrders: readonly Order[] | undefined }>({
        mutationFn: (orderId: string) => apiService.updateOrder({ 
            orderId, 
            updates: { 
                status: 'completed',
                updated_at: new Date().toISOString(),
            } 
        }),
        onMutate: async (orderId: string) => {
            await queryClient.cancelQueries({ queryKey: ['orders'] });
            const previousOrders = queryClient.getQueryData<Order[]>(['orders']);
            queryClient.setQueryData<Order[]>(['orders'], old =>
                old?.map(order => (order.id === orderId ? { ...order, status: 'completed' } : order)) ?? []
            );
            return { previousOrders };
        },
        onError: (err, orderId, context) => {
            if (context?.previousOrders) {
                queryClient.setQueryData(['orders'], context.previousOrders);
            }
            toast.error(t('toast_order_complete_error'));
        },
        onSuccess: (updatedOrder) => {
            toast.success(t('toast_order_completed_success'));
            queryClient.setQueryData<readonly Order[]>(['orders'], (oldData) =>
                oldData?.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)) ?? []
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });

    const { mutate: cancelOrder, isPending: isCancellingOrder } = useMutation<Order, Error, CancelOrderPayload, { previousOrders: readonly Order[] | undefined }>({
        mutationFn: (payload: CancelOrderPayload) => apiService.updateOrder({
            orderId: payload.orderId,
            updates: {
                status: 'cancelled',
                cancellation_note: payload.note,
                updated_at: new Date().toISOString(),
            }
        }),
        onMutate: async (payload: CancelOrderPayload) => {
            await queryClient.cancelQueries({ queryKey: ['orders'] });
            const previousOrders = queryClient.getQueryData<Order[]>(['orders']);
            queryClient.setQueryData<Order[]>(['orders'], old =>
                old?.map(o => o.id === payload.orderId ? { ...o, status: 'cancelled', cancellationNote: payload.note } : o) ?? []
            );
            return { previousOrders };
        },
        onError: (err, payload, context) => {
            if (context?.previousOrders) {
                queryClient.setQueryData(['orders'], context.previousOrders);
            }
            toast.error(t('toast_order_cancel_error'));
        },
        onSuccess: (updatedOrder) => {
            toast.success(t('toast_order_cancelled_success'));
            queryClient.setQueryData<readonly Order[]>(['orders'], (oldData) =>
                oldData?.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)) ?? []
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        }
    });

    return {
        orders,
        isLoadingOrders,
        createOrder,
        isCreatingOrder,
        editOrder,
        isEditingOrder,
        completeOrder,
        completingOrderInfo: {
            isPending: isCompletingOrder,
            orderId: completingOrderVariables ?? null,
        },
        cancelOrder,
        isCancellingOrder,
    };
};
