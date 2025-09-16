/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CashIcon, EyeIcon, EyeOffIcon } from './icons';

const LoginView: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    await login(username, password);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex flex-col items-center mb-6">
          <CashIcon className="w-12 h-12 text-green-400" />
          <h1 className="text-3xl font-bold text-white mt-2">Restaurant POS</h1>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-center text-white mb-6">{t('login_title')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder={t('login_username_placeholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              autoFocus
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login_password_placeholder')}
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
            {error && <p className="text-red-400 text-sm text-center">{t('login_error_message')}</p>}
            <button 
              type="submit" 
              className="mt-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-lg transition-colors disabled:bg-gray-600 disabled:cursor-wait flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? '...' : t('login_button')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;