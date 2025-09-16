/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import type { CreateExpensePayload } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useModalA11y } from '../hooks/useModalA11y';

interface AddExpenseModalProps {
  onClose: () => void;
  onAddExpense: (payload: CreateExpensePayload) => void;
  isSubmitting: boolean;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose, onAddExpense, isSubmitting }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  useModalA11y(modalRef, onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (description && !isNaN(amountNum) && amountNum > 0) {
      onAddExpense({ description, amount: amountNum });
    }
  };

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
        <h2 className="text-2xl font-bold mb-4 text-white">{t('modal_add_expense_title')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={t('modal_add_expense_desc_placeholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            autoFocus
          />
          <input
            type="number"
            placeholder={t('modal_add_expense_amount_placeholder')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            min="0"
            step="0.01"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors">{t('common_cancel')}</button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-wait"
            >
              {isSubmitting ? '...' : t('common_add_expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
