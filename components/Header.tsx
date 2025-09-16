/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { CashIcon, LogoutIcon } from './icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    businessName: string;
    onLogoutRequest: () => void;
    currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ businessName, onLogoutRequest, currentPage }) => {
  const { t, locale, setLocale } = useLanguage();
  const { currentUser } = useAuth();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'es' : 'en');
  };

  const getPageTitle = (title: string) => {
    const key = `nav_${title}` as any;
    return t(key);
  }

  const getRoleName = (role: string) => {
    const key = `header_role_${role}` as any;
    return t(key);
  }
  
  const pageTitle = currentPage || 'dashboard';

  return (
    <header className="w-full py-3 px-4 sm:px-6 border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <CashIcon className="w-8 h-8 text-green-400" />
              <h1 className="text-xl font-bold tracking-tight text-gray-100 hidden sm:block">
                {businessName}
              </h1>
          </div>
          <div className="text-lg font-semibold capitalize text-gray-300 hidden md:block">
            {getPageTitle(pageTitle)}
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="text-right">
                 <p className="font-semibold text-white text-sm">{currentUser.username}</p>
                 <p className="text-xs text-gray-400">{getRoleName(currentUser.role)}</p>
              </div>
            )}
            <button 
              onClick={toggleLocale}
              className="font-bold text-sm bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded-md transition-colors"
            >
              {locale.toUpperCase()}
            </button>
            {currentUser && (
               <button onClick={onLogoutRequest} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" title={t('header_logout_button')}>
                 <LogoutIcon className="w-5 h-5" />
               </button>
            )}
          </div>
      </div>
    </header>
  );
};

export default Header;