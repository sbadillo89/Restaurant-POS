/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import type { Expense } from '../types';
import { PlusIcon } from './icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

interface ExpensesViewProps {
  expenses: Expense[];
  isLoading: boolean;
  onAddExpense: () => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, isLoading, onAddExpense }) => {
  const { t, formatCurrency } = useLanguage();
  const { currentUser } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('expenses_title')}</h2>
        {currentUser?.role === 'admin' && (
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            {t('expenses_add')}
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <ul className="divide-y divide-gray-700">
          {expenses.length > 0 ? expenses.map(expense => (
            <li key={expense.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-sm text-gray-400">{new Date(expense.timestamp).toLocaleTimeString()}</p>
              </div>
              <span className="font-bold text-lg text-red-400">-${formatCurrency(expense.amount)}</span>
            </li>
          )) : (
            <li className="p-4 text-center text-gray-500">{t('expenses_no_expenses')}</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ExpensesView;