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
import type { CreateExpensePayload } from '../types';

export const useExpenses = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const { currentUser } = useAuth();

    const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
        queryKey: ['expenses'],
        queryFn: apiService.getExpenses,
        enabled: !!currentUser && currentUser.role === 'admin',
    });

    // --- REALTIME SUBSCRIPTION ---
    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            return;
        }
        
        // FIX: Updated to the new Supabase V2 Realtime subscription syntax.
        // The previous syntax `supabase.from().on()` is deprecated.
        const channel = supabase
            .channel('public:expenses')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, (payload) => {
                console.log('Realtime change received for expenses!', payload);
                queryClient.invalidateQueries({ queryKey: ['expenses'] });
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            })
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                  console.log('Successfully subscribed to expenses changes.');
                }
                if (status === 'CHANNEL_ERROR') {
                  console.error('Failed to subscribe to expenses changes:', err);
                }
            });

        return () => {
            // FIX: Updated to the new Supabase V2 subscription cleanup method.
            // `removeSubscription` is deprecated; `removeChannel` is now used.
            supabase.removeChannel(channel);
        };
    }, [queryClient, currentUser]);

    const { mutate: createExpense, isPending: isCreatingExpense } = useMutation({
        mutationFn: (payload: CreateExpensePayload) => apiService.createExpense(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            toast.success(t('toast_expense_added_success'));
        },
        onError: () => {
            toast.error(t('toast_expense_added_error'));
        },
    });

    return {
        expenses,
        isLoadingExpenses,
        createExpense,
        isCreatingExpense,
    };
};
