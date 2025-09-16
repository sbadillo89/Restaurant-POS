/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Spinner from './Spinner';

interface ReportsViewProps {
  stats: {
    income: number;
    totalExpenses: number;
    net: number;
  };
  isLoading: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const ReportRow: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className="flex justify-between items-center py-4 border-b border-gray-700">
        <span className="text-lg text-gray-300">{label}</span>
        <span className={`text-2xl font-bold ${className}`}>{value}</span>
    </div>
);

const ReportsView: React.FC<ReportsViewProps> = ({ stats, isLoading, selectedDate, onDateChange }) => {
  const { t, formatCurrency } = useLanguage();

  const reportContent = (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {isLoading ? (
        <div className="flex justify-center items-center h-48"><Spinner /></div>
      ) : (
        <>
          <ReportRow label={t('reports_income')} value={`$${formatCurrency(stats.income)}`} className="text-green-400" />
          <ReportRow label={t('reports_expenses')} value={`-$${formatCurrency(stats.totalExpenses)}`} className="text-red-400" />
          <div className="flex justify-between items-center py-4 mt-4">
            <span className="text-xl font-bold text-white">{t('reports_profit')}</span>
            <span className={`text-3xl font-extrabold ${stats.net >= 0 ? "text-blue-400" : "text-red-400"}`}>
                ${formatCurrency(stats.net)}
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in flex flex-col gap-6">
       <h2 className="text-2xl font-bold text-center">{t('reports_title')}</h2>

       <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <label htmlFor="report-date" className="font-semibold text-gray-300">{t('reports_select_date')}:</label>
            <input
                type="date"
                id="report-date"
                value={selectedDate.toLocaleDateString('en-CA')} // YYYY-MM-DD format
                onChange={(e) => onDateChange(new Date(e.target.value + 'T00:00:00'))}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
       </div>
       {reportContent}
    </div>
  );
};

export default ReportsView;