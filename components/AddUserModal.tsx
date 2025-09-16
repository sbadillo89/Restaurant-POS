/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import type { CreateUserPayload, UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EyeIcon, EyeOffIcon } from './icons';
import { useModalA11y } from '../hooks/useModalA11y';

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: (payload: CreateUserPayload) => void;
  isSubmitting: boolean;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser, isSubmitting }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('waiter');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  useModalA11y(modalRef, onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim() && role) {
      console.log(role)
      onAddUser({ username: username.trim(), password, role });
    }
  };

  const roles: UserRole[] = ['admin', 'waiter', 'kitchen'];

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">{t('modal_add_user_title')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={t('modal_add_user_username_placeholder')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            autoFocus
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('modal_add_user_password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize"
            required
          >
            <option value="" disabled>{t('modal_add_user_select_role')}</option>
            {roles.map(r => (
              <option key={r} value={r} className="capitalize">{t(`header_role_${r}` as any)}</option>
            ))}
          </select>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors">{t('common_cancel')}</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-wait"
            >
              {isSubmitting ? '...' : t('common_add_user')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
