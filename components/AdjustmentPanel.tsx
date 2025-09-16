/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useMemo } from 'react';
import type { Order } from '../types';
import { PlusIcon, NoteIcon } from './icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

interface OrdersViewProps {
  orders: readonly Order[];
  isLoading: boolean;
  onAddOrder: () => void;
  onCompleteOrder: (orderId: string) => void;
  onEditOrder: (order: Order) => void;
  onCancelOrder: (order: Order) => void;
  completingOrder: { isPending: boolean; orderId: string | null };
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders, isLoading, onAddOrder, onCompleteOrder, onEditOrder, onCancelOrder, completingOrder }) => {
  const { t, formatCurrency } = useLanguage();
  const { currentUser } = useAuth();
  
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const OrderCard = ({ order }: { order: Readonly<Order> }) => {
    const discountAmount = useMemo(() => {
      if (order.discountType === 'percentage') {
        return order.subtotal * (order.discountValue / 100);
      }
      if (order.discountType === 'fixed') {
        return order.discountValue;
      }
      return 0;
    }, [order]);

    const isCompleting = completingOrder.isPending && completingOrder.orderId === order.id;

    return (
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg">Order #{order.id.slice(-4)}</p>
              <ul className="list-disc list-inside text-gray-400 mt-1">
                {order.items.map((item) => (
                  <li key={item.productId}>{item.quantity}x {item.name}</li>
                ))}
              </ul>
              {order.note && (
                <div className="mt-2 flex items-start gap-2 text-yellow-300/90">
                  <NoteIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm italic">{order.note}</p>
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                <p className="font-bold text-xl text-green-400">${formatCurrency(order.total)}</p>
                <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                  <p>Sub: ${formatCurrency(order.subtotal)}</p>
                  {discountAmount > 0 && (
                    <p className="text-yellow-400">Disc: -${formatCurrency(discountAmount)}</p>
                  )}
                  <p>Tax: +${formatCurrency(order.taxAmount)}</p>
                </div>
                <div className="mt-3 flex gap-2 justify-end">
                  <button
                    onClick={() => onCancelOrder(JSON.parse(JSON.stringify(order)))}
                    className="py-1 px-3 bg-red-700 hover:bg-red-600 rounded-md text-sm font-semibold transition-colors"
                  >
                      {t('orders_cancel_button')}
                  </button>
                  {currentUser?.role !== 'kitchen' && (
                    <>
                      <button
                        onClick={() => onEditOrder(JSON.parse(JSON.stringify(order)))}
                        className="py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-semibold transition-colors"
                      >
                          {t('orders_edit_button')}
                      </button>
                      <button 
                        onClick={() => onCompleteOrder(order.id)}
                        disabled={isCompleting}
                        className="py-1 px-3 bg-green-600 hover:bg-green-500 rounded-md text-sm font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-wait"
                      >
                          {isCompleting ? '...' : t('orders_complete_button')}
                      </button>
                    </>
                  )}
                </div>
            </div>
        </div>
      </div>
    )
  }

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
        <h2 className="text-2xl font-bold">{t('orders_title')}</h2>
        {currentUser?.role !== 'kitchen' && (
          <button
            onClick={onAddOrder}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            {t('orders_add')}
          </button>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3 text-yellow-400">{t('orders_pending')}</h3>
        <div className="flex flex-col gap-4">
          {pendingOrders.length > 0 ? pendingOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          )) : <p className="text-gray-500">{t('orders_no_pending')}</p>}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-3 text-gray-400">{t('orders_completed')}</h3>
        <div className="flex flex-col gap-4">
          {completedOrders.length > 0 ? completedOrders.map(order => (
            <div key={order.id} className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/60 opacity-70">
              <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">Order #{order.id.slice(-4)}</p>
                    <p className="text-gray-400 text-sm">{order.items.length} {t('orders_items')}</p>
                  </div>
                  <p className="font-bold text-lg text-green-500/80">${formatCurrency(order.total)}</p>
              </div>
            </div>
          )) : <p className="text-gray-500">{t('orders_no_completed')}</p>}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3 text-red-400/80">{t('orders_cancelled')}</h3>
        <div className="flex flex-col gap-4">
          {cancelledOrders.length > 0 ? cancelledOrders.map(order => (
            <div key={order.id} className="bg-gray-800/60 p-4 rounded-lg border border-red-700/40 opacity-70">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">Order #{order.id.slice(-4)}</p>
                    <p className="text-gray-400 text-sm">{order.items.length} {t('orders_items')}</p>
                    {order.cancellationNote && (
                      <p className="text-sm mt-2 text-red-300/90"><span className="font-semibold">{t('orders_cancellation_reason')}:</span> {order.cancellationNote}</p>
                    )}
                  </div>
                  <p className="font-bold text-lg text-red-500/80 line-through">${formatCurrency(order.total)}</p>
              </div>
            </div>
          )) : <p className="text-gray-500">{t('orders_no_cancelled')}</p>}
        </div>
      </div>

    </div>
  );
};

export default OrdersView;