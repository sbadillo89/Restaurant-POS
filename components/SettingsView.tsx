/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import type { Settings, UpdateSettingsPayload, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, TrashIcon } from './icons';
import Spinner from './Spinner';

interface SettingsViewProps {
  settings: Settings;
  isLoading: boolean;
  onSettingsChange: (payload: UpdateSettingsPayload) => void;
  users: User[];
  onAddUser: () => void;
  onDeleteUser: (user: User) => void;
  isSavingSettings: boolean;
  deletingUser: { isPending: boolean; userId: string | null };
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, isLoading, onSettingsChange, users, onAddUser, onDeleteUser, isSavingSettings, deletingUser }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [salesTaxRate, setSalesTaxRate] = useState(String(settings.salesTaxRate || 0));

  useEffect(() => {
    setBusinessName(settings.businessName);
    setSalesTaxRate(String(settings.salesTaxRate || 0));
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const taxRateNum = parseFloat(salesTaxRate);
    onSettingsChange({ 
      businessName,
      salesTaxRate: isNaN(taxRateNum) ? 0 : taxRateNum,
    });
  };

  const handleCancel = () => {
    setBusinessName(settings.businessName);
    setSalesTaxRate(String(settings.salesTaxRate || 0));
  };

  const getRoleName = (role: string) => {
    const key = `header_role_${role}` as any;
    return t(key);
  }

  const handleDeleteUser = (user: User) => {
    onDeleteUser(user);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-center">{t('settings_title')}</h2>
      
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="business-name" className="font-semibold text-gray-300">
              {t('settings_business_name_label')}
            </label>
            <input
              type="text"
              id="business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t('settings_business_name_placeholder')}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sales-tax-rate" className="font-semibold text-gray-300">
              {t('settings_sales_tax_rate_label')}
            </label>
            <input
              type="number"
              id="sales-tax-rate"
              value={salesTaxRate}
              onChange={(e) => setSalesTaxRate(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button 
              type="button"
              onClick={handleCancel}
              className="py-2 px-6 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors"
            >
              {t('common_cancel')}
            </button>
            <button 
              type="submit" 
              disabled={isSavingSettings}
              className="py-2 px-6 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-wait"
            >
              {isSavingSettings ? '...' : t('settings_save_button')}
            </button>
          </div>
        </form>
      </div>

      {currentUser?.role === 'admin' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{t('settings_users_title')}</h3>
            <button
              onClick={onAddUser}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              {t('settings_add_user_button')}
            </button>
          </div>
          <ul className="divide-y divide-gray-700">
            {users.map(user => {
              const isDeletingThisUser = deletingUser.isPending && deletingUser.userId === user.id;
              return (
              <li key={user.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-400 capitalize bg-gray-700 px-2 py-1 rounded-md">{getRoleName(user.role)}</p>
                </div>
                <button
                  onClick={() => handleDeleteUser(user)}
                  disabled={user.id === currentUser.id || user.username === 'sysadmin' || isDeletingThisUser}
                  className="p-2 rounded-md text-red-400 hover:bg-red-500/20 disabled:text-gray-500 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors flex items-center justify-center h-9 w-9"
                  title={t('settings_delete_user_button')}
                >
                  {isDeletingThisUser ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : <TrashIcon className="w-5 h-5" />}
                </button>
              </li>
            )})}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SettingsView;