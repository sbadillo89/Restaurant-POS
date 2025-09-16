/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import type { CreateProductPayload, Category } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useModalA11y } from '../hooks/useModalA11y';

interface AddProductModalProps {
  onClose: () => void;
  onAddProduct: (payload: CreateProductPayload) => void;
  categories: Category[];
  isSubmitting: boolean;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAddProduct, categories, isSubmitting }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [inStock, setInStock] = useState(true);
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  useModalA11y(modalRef, onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (name && !isNaN(priceNum) && priceNum > 0 && categoryId) {
      onAddProduct({ name, price: priceNum, category_id: categoryId, in_stock: inStock });
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
        <h2 className="text-2xl font-bold mb-4 text-white">{t('modal_add_product_title')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={t('modal_add_product_name_placeholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            autoFocus
          />
          <input
            type="number"
            placeholder={t('modal_add_product_price_placeholder')}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            min="0"
            step="0.01"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="" disabled>{t('modal_add_product_select_category')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="in-stock-checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="in-stock-checkbox" className="text-gray-300">
              {t('modal_add_product_in_stock_label')}
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors">{t('common_cancel')}</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-wait"
            >
              {isSubmitting ? '...' : t('common_add_product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
