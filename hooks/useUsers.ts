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
import type { User, CreateUserPayload } from '../types';

export const useUsers = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const { currentUser } = useAuth();

    const { data: users = [], isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: apiService.getUsers,
        enabled: !!currentUser && currentUser.role === 'admin',
    });

    // --- REALTIME SUBSCRIPTION ---
    useEffect(() => {
        if (currentUser?.role !== 'admin') return;

        // FIX: Updated to the new Supabase V2 Realtime subscription syntax.
        // The previous syntax `supabase.from().on()` is deprecated.
        const channel = supabase
            .channel('public:profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
                console.log('Realtime change received for users/profiles!', payload);
                queryClient.invalidateQueries({ queryKey: ['users'] });
            })
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                  console.log('Successfully subscribed to profiles changes.');
                }
                if (status === 'CHANNEL_ERROR') {
                  console.error('Failed to subscribe to profiles changes:', err);
                }
            });

        return () => {
            // FIX: Updated to the new Supabase V2 subscription cleanup method.
            // `removeSubscription` is deprecated; `removeChannel` is now used.
            supabase.removeChannel(channel);
        };
    }, [queryClient, currentUser]);

    const { mutate: createUser, isPending: isCreatingUser } = useMutation<User, Error, CreateUserPayload>({
        mutationFn: apiService.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(t('toast_user_created_success'));
        },
        onError: (error: Error) => {
            // The error message from apiService is now more specific,
            // e.g., "Username already exists. Please choose another."
            toast.error(error.message);
            console.error(error);
        },
    });

    const { mutate: deleteUser, isPending: isDeletingUser, variables: deletingUserVariables } = useMutation<void, Error, string, { previousUsers: User[] | undefined }>({
        mutationFn: apiService.deleteUser,
        onMutate: async (userId: string) => {
            await queryClient.cancelQueries({ queryKey: ['users'] });
            const previousUsers = queryClient.getQueryData<User[]>(['users']);
            queryClient.setQueryData<User[]>(['users'], old => old?.filter(u => u.id !== userId) ?? []);
            return { previousUsers };
        },
        onError: (err, userId, context) => {
            if (context?.previousUsers) {
                queryClient.setQueryData(['users'], context.previousUsers);
            }
            toast.error(t('toast_user_deleted_error'));
        },
        onSuccess: () => {
            toast.success(t('toast_user_deleted_success'));
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    return {
        users,
        isLoadingUsers,
        createUser,
        isCreatingUser,
        deleteUser,
        deletingUserInfo: {
            isPending: isDeletingUser,
            userId: deletingUserVariables ?? null,
        },
    };
};
