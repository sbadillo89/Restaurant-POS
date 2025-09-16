/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export type RealtimeStatus = 'connected' | 'reconnecting' | 'error';

/**
 * A custom hook that monitors the status of the Supabase Realtime connection.
 * It provides a simple status string that can be used to display UI feedback.
 * @returns {RealtimeStatus} The current status of the connection.
 */
export const useRealtimeStatus = (): RealtimeStatus => {
  const [status, setStatus] = useState<RealtimeStatus>('connected');
  const { currentUser } = useAuth();

  useEffect(() => {
    // Only monitor connection if a user is logged in.
    if (!currentUser) {
      return;
    }

    const channel = supabase.channel('app-connection-monitor');

    channel
      .on('system', { event: 'postgres_changes' }, (payload) => {
        // This is a low-level event that can indicate the connection is alive.
        // We can use it to confirm connection if we were reconnecting.
        if (status === 'reconnecting') {
            setStatus('connected');
        }
      })
      .subscribe((subscribeStatus, err) => {
        if (subscribeStatus === 'SUBSCRIBED') {
          console.log('Realtime connection monitor SUBSCRIBED.');
          setStatus('connected');
        }
        if (subscribeStatus === 'CHANNEL_ERROR') {
          console.error('Realtime connection monitor CHANNEL_ERROR:', err);
          setStatus('error');
        }
        if (subscribeStatus === 'TIMED_OUT') {
            console.warn('Realtime connection monitor TIMED_OUT. Attempting to reconnect.');
            setStatus('reconnecting');
        }
      });

    // Supabase client also has connection status events, which can be more reliable.
    const handleOnline = () => {
        console.log("Browser is online, attempting to reconnect Supabase Realtime.");
        setStatus('reconnecting');
        supabase.realtime.connect();
    };
    
    const handleOffline = () => {
        console.warn("Browser is offline. Realtime connection will be paused.");
        setStatus('error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]); // FIX: Removed `status` from dependency array to prevent re-subscribing on every status change.

  return status;
};