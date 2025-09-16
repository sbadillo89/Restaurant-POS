/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef } from 'react';

const STUCK_TIMEOUT = 20000; // 20 seconds

/**
 * A custom hook that acts as a watchdog timer. It detects if the application
 * remains in a "stuck" state (e.g., loading) for too long and triggers a callback.
 *
 * @param isStuck A boolean indicating if the app is currently in the state being monitored.
 * @param onStuck A callback function to execute when the timeout is reached.
 */
export const useStuckDetector = (isStuck: boolean, onStuck: () => void) => {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // If the app is stuck, start the timer.
    if (isStuck) {
      // Avoid setting multiple timers.
      if (timerRef.current === null) {
        timerRef.current = window.setTimeout(() => {
          console.error(`Application stuck for over ${STUCK_TIMEOUT}ms. Triggering recovery.`);
          onStuck();
        }, STUCK_TIMEOUT);
      }
    } else {
      // If the app is no longer stuck, clear any existing timer.
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup the timer when the component unmounts.
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isStuck, onStuck]);
};
