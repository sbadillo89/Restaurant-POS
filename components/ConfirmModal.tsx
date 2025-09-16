/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useModalA11y } from '../hooks/useModalA11y';

interface ConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  confirmButtonColor?: string;
  isSubmitting?: boolean;
  hideCancelButton?: boolean;
  disableOverlayClose?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmButtonText,
  confirmButtonColor = 'bg-red-600 hover:bg-red-500',
  isSubmitting = false,
  hideCancelButton = false,
  disableOverlayClose = false
}) => {
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  useModalA11y(modalRef, disableOverlayClose ? () => {} : onClose);

  const handleOverlayClick = () => {
    if (!disableOverlayClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-gray-300 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex justify-end gap-3 mt-4">
          {!hideCancelButton && (
            <button 
              type="button" 
              onClick={onClose} 
              className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors"
              autoFocus
            >
              {t('common_cancel')}
            </button>
          )}
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`py-2 px-4 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed ${confirmButtonColor}`}
            autoFocus={hideCancelButton}
          >
            {isSubmitting ? '...' : (confirmButtonText || t('common_delete'))}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;