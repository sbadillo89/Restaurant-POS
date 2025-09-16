/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { RealtimeStatus } from '../hooks/useRealtimeStatus';

interface ConnectionStatusIndicatorProps {
  status: RealtimeStatus;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ status }) => {
  const { t } = useLanguage();

  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      pingColor: 'bg-green-400',
      titleKey: 'connection_status_connected',
    },
    reconnecting: {
      color: 'bg-yellow-500',
      pingColor: 'bg-yellow-400',
      titleKey: 'connection_status_reconnecting',
    },
    error: {
      color: 'bg-red-500',
      pingColor: 'bg-red-400',
      titleKey: 'connection_status_error',
    },
  };

  const { color, pingColor, titleKey } = statusConfig[status];
  const title = t(titleKey as any);

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex items-center justify-center"
      title={title}
      aria-live="polite"
      aria-label={title}
    >
      <div className={`relative w-4 h-4 rounded-full ${color}`}>
        {status !== 'error' && (
          <div className={`absolute -top-0 -left-0 w-4 h-4 rounded-full ${pingColor} animate-ping-sm`}></div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusIndicator;