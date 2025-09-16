/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import type { Product, UpdateProductStockPayload, Category } from '../types';
import { PlusIcon } from './icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  onAddProduct: () => void;
  onAddCategory: () => void;
  onUpdateStock: (payload: UpdateProductStockPayload) => void;
  updatingStock: { isPending: boolean; productId: string | null };
}

const ProductsView: React.FC<ProductsViewProps> = ({ products, categories, isLoading, onAddProduct, onAddCategory, onUpdateStock, updatingStock }) => {
  const { t, formatCurrency } = useLanguage();
  const { currentUser } = useAuth();

  const categorizedProducts = categories.map(category => ({
      categoryName: category.name,
      items: products.filter(p => p.category === category.name),
  }));

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const handleToggleStock = () => {
      onUpdateStock({ productId: product.id, inStock: !product.inStock });
    };

    const isUpdating = updatingStock.isPending && updatingStock.productId === product.id;

    return (
      <div className={`bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col gap-3 transition-opacity ${!product.inStock && 'opacity-60'}`}>
        <div className="flex justify-between items-start">
          <div>
            <span className="font-medium">{product.name}</span>
            <span className="block text-sm text-gray-400">
              {product.inStock ? (
                <span className="text-green-400">{t('products_stock_status_in')}</span>
              ) : (
                <span className="text-red-400 font-semibold">{t('products_stock_status_out')}</span>
              )}
            </span>
          </div>
          <span className="font-bold text-lg text-green-400">${formatCurrency(product.price)}</span>
        </div>
        
        {currentUser?.role === 'admin' && (
          <button
            onClick={handleToggleStock}
            disabled={isUpdating}
            className={`w-full text-sm py-1.5 rounded-md font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-wait ${
              product.inStock 
                ? 'bg-yellow-600 hover:bg-yellow-500' 
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isUpdating ? '...' : (product.inStock ? t('products_mark_out_of_stock') : t('products_mark_in_stock'))}
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in flex flex-col gap-6">
       <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-bold">{t('products_title')}</h2>
        {currentUser?.role === 'admin' && (
          <div className="flex gap-2">
            <button
              onClick={onAddCategory}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              {t('products_add_category')}
            </button>
            <button
              onClick={onAddProduct}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              {t('products_add')}
            </button>
          </div>
        )}
      </div>
      
      {categorizedProducts.map(({ categoryName, items }) => (
        items.length > 0 && (
            <div key={categoryName}>
                <h3 className="text-xl font-semibold mb-3 text-gray-300 border-b border-gray-700 pb-2 capitalize">{categoryName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map(product => (
                      <ProductCard key={product.id} product={product} />
                  ))}
                </div>
            </div>
        )
      ))}
    </div>
  );
};

export default ProductsView;