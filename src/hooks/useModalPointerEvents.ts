import { useEffect } from 'react';

/**
 * Custom hook to manage pointer events for modals
 * Prevents the body from losing pointer events when modals are open/closing
 */
export const useModalPointerEvents = (isOpen: boolean) => {
  useEffect(() => {
    const body = document.body;
    
    if (!isOpen) {
      // If modal is closed/closing, ensure pointer events are restored
      const restorePointerEvents = () => {
        body.style.pointerEvents = 'auto';
      };
      
      // Immediate restoration
      restorePointerEvents();
      
      // Delayed restoration to handle animation timing
      const timeouts = [
        setTimeout(restorePointerEvents, 50),
        setTimeout(restorePointerEvents, 200),
        setTimeout(restorePointerEvents, 500),
      ];
      
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
    
    // When modal is open, ensure body maintains pointer events
    body.style.pointerEvents = 'auto';
  }, [isOpen]);
  
  // Additional effect to watch for style changes
  useEffect(() => {
    const body = document.body;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'style' &&
          body.style.pointerEvents === 'none'
        ) {
          // Restore pointer events if they get set to none
          setTimeout(() => {
            body.style.pointerEvents = 'auto';
          }, 0);
        }
      });
    });
    
    observer.observe(body, {
      attributes: true,
      attributeFilter: ['style']
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
}; 