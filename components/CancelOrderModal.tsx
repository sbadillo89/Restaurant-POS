/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import type { CancelOrderPayload, Order } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useModalA11y } from '../hooks/useModalA11y';

interface CancelOrderModalProps {
  onClose: () => void;
  onConfirm: (payload: CancelOrderPayload) => void;
  order: Order;
  isSubmitting: boolean;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ onClose, onConfirm, order, isSubmitting }) => {
  const [reason, setReason] = useState('');
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  useModalA11y(modalRef, onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm({ orderId: order.id, note: reason.trim() });
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
        <h2 className="text-2xl font-bold mb-4 text-white">{t('modal_cancel_order_title')} #{order.id.slice(-4)}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="cancellation-reason" className="font-semibold text-gray-300">
              {t('modal_cancel_order_reason_label')}
            </label>
            <textarea
              id="cancellation-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('modal_cancel_order_reason_placeholder')}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
              autoFocus
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors"
            >
              {t('common_cancel')}
            </button>
            <button 
              type="submit" 
              disabled={!reason.trim() || isSubmitting}
              className="py-2 px-4 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '...' : t('common_confirm_cancellation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;
