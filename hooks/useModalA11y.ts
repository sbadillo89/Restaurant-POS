/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, RefObject } from 'react';

// Standard selector for focusable elements
const FOCUSABLE_SELECTORS = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * A custom hook to improve modal accessibility.
 * - Traps focus within the modal container.
 * - Allows closing the modal with the Escape key.
 * @param modalRef A React ref attached to the modal's root element.
 * @param onClose The function to call when the modal should be closed.
 */
export const useModalA11y = (modalRef: RefObject<HTMLElement>, onClose: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close modal on Escape key press
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Handle focus trapping on Tab key press
      if (event.key === 'Tab') {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        // Find all focusable elements within the modal that are currently visible
        const focusableElements = Array.from(
          modalElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
        ).filter(el => el.offsetParent !== null);
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab: if focus is on the first element, move to the last
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          // Tab: if focus is on the last element, move to the first
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalRef, onClose]);
};
