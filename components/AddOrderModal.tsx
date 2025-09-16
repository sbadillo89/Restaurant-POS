/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef } from 'react';
import type { Product, Order, OrderItem, CreateOrderPayload, EditOrderPayload, Settings, DiscountType, Category } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { PlusIcon, MinusIcon, TrashIcon, CloseIcon } from './icons';
import { useModalA11y } from '../hooks/useModalA11y';

interface AddOrderModalProps {
  onClose: () => void;
  onSaveOrder: (payload: CreateOrderPayload) => void;
  onUpdateOrder: (payload: EditOrderPayload) => void;
  orderToEdit?: Readonly<Order> | null;
  products: Product[];
  categories: Category[];
  settings: Settings;
  isSubmitting: boolean;
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ onClose, onSaveOrder, onUpdateOrder, orderToEdit, products, categories, settings, isSubmitting }) => {
  const { t, formatCurrency } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  useModalA11y(modalRef, onClose);

  // FIX: Use lazy state initialization to derive state from props.
  // This is more robust than using a useEffect and prevents potential race conditions
  // or bugs during re-renders, such as item duplication on update.
  const [currentOrderItems, setCurrentOrderItems] = useState<Map<string, OrderItem>>(() => {
    if (!orderToEdit) return new Map();
    const itemsMap = new Map<string, OrderItem>();
    orderToEdit.items.forEach(item => itemsMap.set(item.productId, { ...item }));
    return itemsMap;
  });

  const [note, setNote] = useState(() => orderToEdit?.note || '');
  const [discountType, setDiscountType] = useState<DiscountType>(() => orderToEdit?.discountType || 'none');
  const [discountValue, setDiscountValue] = useState(() => String(orderToEdit?.discountValue || ''));

  const isEditMode = !!orderToEdit;

  const categorizedProducts = useMemo(() => categories.map(category => ({
    categoryName: category.name,
    items: products.filter(p => p.category === category.name),
  })), [products, categories]);

  const handleAddItem = (product: Product) => {
    if (!product.inStock) return;
    setCurrentOrderItems(prev => {
      const newItems = new Map(prev);
      const existingItem = newItems.get(product.id);
      if (existingItem) {
        newItems.set(product.id, { ...existingItem, quantity: existingItem.quantity + 1 });
      } else {
        newItems.set(product.id, {
          productId: product.id,
          name: product.name,
          quantity: 1,
          priceAtOrder: product.price,
        });
      }
      return newItems;
    });
  };

  const handleUpdateQuantity = (productId: string, change: 1 | -1) => {
    setCurrentOrderItems(prev => {
      const newItems = new Map(prev);
      const item = newItems.get(productId);
      if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          newItems.delete(productId);
        } else {
          newItems.set(productId, { ...item, quantity: newQuantity });
        }
      }
      return newItems;
    });
  };
  
  const handleRemoveItem = (productId: string) => {
    setCurrentOrderItems(prev => {
        const newItems = new Map(prev);
        newItems.delete(productId);
        return newItems;
    });
  }

  const orderTotals = useMemo(() => {
    const subtotal = Array.from(currentOrderItems.values()).reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);

    const parsedDiscountValue = parseFloat(discountValue) || 0;
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = subtotal * (parsedDiscountValue / 100);
    } else if (discountType === 'fixed') {
      discountAmount = parsedDiscountValue;
    }
    
    discountAmount = Math.min(subtotal, Math.max(0, discountAmount));

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (settings.salesTaxRate / 100);
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  }, [currentOrderItems, discountType, discountValue, settings.salesTaxRate]);
  
  const handleSubmit = () => {
    if (currentOrderItems.size === 0) return;
    
    const finalDiscountValue = parseFloat(discountValue) || 0;
    const commonPayload: CreateOrderPayload = {
      items: Array.from(currentOrderItems.values()),
      note: note,
      discountType,
      discountValue: discountType === 'none' ? 0 : finalDiscountValue,
    };

    if (isEditMode && orderToEdit) {
      onUpdateOrder({
        ...commonPayload,
        orderId: orderToEdit.id,
      });
    } else {
      onSaveOrder(commonPayload);
    }
  };

  const orderItemsArray = Array.from(currentOrderItems.values());

  const FinancialRow: React.FC<{label: string, value: string, className?: string}> = ({label, value, className}) => (
    <div className={`flex justify-between items-center ${className || ''}`}>
      <span className="text-gray-300">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );

  return (
    <div ref={modalRef} className="fixed inset-0 bg-gray-900/80 z-50 flex flex-col animate-fade-in p-4 sm:p-6">
        <header className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">{isEditMode ? t('modal_edit_order_title') : t('modal_add_order_title')}</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
        </header>
        
        <div className="flex-grow flex flex-col md:flex-row gap-6 mt-6 overflow-hidden">
            {/* Products List */}
            <div className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">{t('modal_add_order_products')}</h3>
                <div className="flex flex-col gap-4">
                    {categorizedProducts.map(({ categoryName, items }) => (
                        items.length > 0 && (
                            <div key={categoryName}>
                                <h4 className="font-bold text-blue-400 mb-2 capitalize">{categoryName}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {items.map(product => (
                                        <button 
                                          key={product.id} 
                                          onClick={() => handleAddItem(product)} 
                                          disabled={!product.inStock}
                                          className="relative bg-gray-700/80 p-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                                        >
                                            <p className="font-semibold">{product.name}</p>
                                            <p className="text-sm text-green-400">${formatCurrency(product.price)}</p>
                                            {!product.inStock && (
                                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                                <span className="text-red-400 font-bold text-xs uppercase tracking-wider">{t('products_stock_status_out')}</span>
                                              </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* Current Order */}
            <div className="w-full md:w-2/5 lg:w-1/3 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
                <h3 className="text-xl font-semibold p-4 border-b border-gray-700 text-gray-200 flex-shrink-0">{t('modal_add_order_current')}</h3>
                <div className="flex-1 p-4 overflow-y-auto">
                    {orderItemsArray.length === 0 ? (
                        <p className="text-gray-500 text-center mt-8">{t('modal_add_order_no_items')}</p>
                    ) : (
                        <ul className="space-y-3">
                            {orderItemsArray.map(item => (
                                <li key={item.productId} className="p-2 pr-3 flex items-center justify-between bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex-shrink-0 bg-gray-800 rounded-md w-12 h-12 flex flex-col items-center justify-center">
                                            <span className="font-bold text-lg text-white">{item.quantity}</span>
                                            <span className="text-xs text-gray-400">QTY</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-white">{item.name}</p>
                                            <p className="text-sm text-gray-400">${formatCurrency(item.priceAtOrder)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => handleUpdateQuantity(item.productId, -1)} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"><MinusIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleUpdateQuantity(item.productId, 1)} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"><PlusIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleRemoveItem(item.productId)} className="ml-1 p-2 rounded-full text-red-400 hover:bg-red-400/20 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800/50">
                    <div className="mb-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label htmlFor="discount-type" className="block text-sm font-medium text-gray-300 mb-1">{t('modal_add_order_discount_type')}</label>
                          <select 
                            id="discount-type"
                            value={discountType}
                            onChange={e => setDiscountType(e.target.value as DiscountType)}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          >
                            <option value="none">{t('discount_type_none')}</option>
                            <option value="percentage">{t('discount_type_percentage')}</option>
                            <option value="fixed">{t('discount_type_fixed')}</option>
                          </select>
                        </div>
                        {discountType !== 'none' && (
                          <div className="flex-1">
                            <label htmlFor="discount-value" className="block text-sm font-medium text-gray-300 mb-1">{t('modal_add_order_discount_value')} {discountType === 'percentage' && '(%)'}</label>
                            <input 
                              type="number"
                              id="discount-value"
                              value={discountValue}
                              onChange={e => setDiscountValue(e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                              placeholder={discountType === 'percentage' ? '10' : '5.00'}
                              min="0"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <FinancialRow label={t('modal_add_order_subtotal')} value={`$${formatCurrency(orderTotals.subtotal)}`} />
                        {orderTotals.discountAmount > 0 && <FinancialRow label={t('modal_add_order_discount')} value={`-$${formatCurrency(orderTotals.discountAmount)}`} className="text-yellow-400" />}
                        <FinancialRow label={t('modal_add_order_tax')} value={`+$${formatCurrency(orderTotals.taxAmount)}`} />
                      </div>
                    </div>

                    <textarea
                        id="order-notes"
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t('modal_add_order_notes_placeholder')}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm mb-4"
                    ></textarea>

                    <div className="flex justify-between items-center mb-4 border-t border-gray-700 pt-4">
                        <span className="text-lg font-bold">{t('modal_add_order_grand_total')}:</span>
                        <span className="text-2xl font-extrabold text-green-400">${formatCurrency(orderTotals.total)}</span>
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={orderItemsArray.length === 0 || isSubmitting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isSubmitting ? '...' : (isEditMode ? t('common_update_order') : t('common_save_order'))}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AddOrderModal;
