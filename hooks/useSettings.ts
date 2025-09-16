/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/apiService';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import type { Settings, UpdateSettingsPayload } from '../types';

const defaultSettings: Settings = { businessName: 'POS', salesTaxRate: 0 };

export const useSettings = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const { currentUser } = useAuth();

    const { data: settings = defaultSettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: apiService.getSettings,
        enabled: !!currentUser && (currentUser.role === 'admin' || currentUser.role === 'waiter'),
    });

    const { mutate: updateSettings, isPending: isUpdatingSettings } = useMutation({
        mutationFn: (payload: UpdateSettingsPayload) => apiService.updateSettings(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success(t('toast_settings_updated_success'));
        },
        onError: () => {
            toast.error(t('toast_settings_updated_error'));
        },
    });

    return {
        settings,
        isLoadingSettings,
        updateSettings,
        isUpdatingSettings,
    };
};