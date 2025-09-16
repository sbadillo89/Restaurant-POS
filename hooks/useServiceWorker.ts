/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect } from 'react';

export const useServiceWorker = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/public/sw.js').then(registration => {
        // A new service worker is waiting to be activated.
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setIsUpdateAvailable(true);
        }

        // Listen for when a new service worker has been found and is installing.
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              // The new service worker has successfully installed and is now waiting.
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setIsUpdateAvailable(true);
              }
            });
          }
        });
      }).catch(error => {
        console.error('Service Worker registration failed:', error);
      });

      // When the new worker takes control, reload the page to apply updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
  }, []);

  const updateServiceWorker = () => {
    if (waitingWorker) {
      // Send a message to the waiting worker to activate itself.
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return { isUpdateAvailable, updateServiceWorker };
};