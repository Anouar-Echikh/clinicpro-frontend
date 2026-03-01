import React, { useState, useEffect } from 'react';
import { RotateCw, ArrowLeftRight } from 'lucide-react';

interface DirectionToggleProps {
  variant?: 'default' | 'compact';
}

const DirectionToggle: React.FC<DirectionToggleProps> = ({ variant = 'default' }) => {
  const [isRTL, setIsRTL] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial direction on mount
  useEffect(() => {
    const htmlElement = document.documentElement;
    setIsRTL(htmlElement.dir === 'rtl');
  }, []);

  const toggleDirection = async () => {
    setIsLoading(true);
    
    try {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      
      if (isRTL) {
        // Switch to LTR
        htmlElement.dir = 'ltr';
        htmlElement.setAttribute('data-direction', 'ltr');
        bodyElement.classList.remove('rtl');
        bodyElement.classList.add('ltr');
        setIsRTL(false);
      } else {
        // Switch to RTL
        htmlElement.dir = 'rtl';
        htmlElement.setAttribute('data-direction', 'rtl');
        bodyElement.classList.remove('ltr');
        bodyElement.classList.add('rtl');
        setIsRTL(true);
      }
      
      // Store preference in localStorage
      localStorage.setItem('textDirection', isRTL ? 'ltr' : 'rtl');
      
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error toggling text direction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved direction preference on mount
  useEffect(() => {
    const savedDirection = localStorage.getItem('textDirection');
    if (savedDirection) {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      
      if (savedDirection === 'rtl') {
        htmlElement.dir = 'rtl';
        htmlElement.setAttribute('data-direction', 'rtl');
        bodyElement.classList.remove('ltr');
        bodyElement.classList.add('rtl');
        setIsRTL(true);
      } else {
        htmlElement.dir = 'ltr';
        htmlElement.setAttribute('data-direction', 'ltr');
        bodyElement.classList.remove('rtl');
        bodyElement.classList.add('ltr');
        setIsRTL(false);
      }
    }
  }, []);

  const buttonClasses = variant === 'compact' 
    ? "flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 min-w-[100px]"
    : "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:from-purple-600 hover:to-purple-700 hover:border-purple-600 hover:text-white transition-all duration-300 min-w-[140px] shadow-sm hover:shadow-lg hover:-translate-y-0.5";

  const loadingClasses = isLoading ? "opacity-80 pointer-events-none" : "";

  return (
    <div className="relative font-sans">
      <button
        onClick={toggleDirection}
        className={`${buttonClasses} ${loadingClasses} relative overflow-hidden`}
        disabled={isLoading}
        title={`Switch to ${isRTL ? 'LTR' : 'RTL'} direction`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        )}
        
        <ArrowLeftRight className={`h-4 w-4 transition-transform duration-300 ${isRTL ? 'rotate-180' : ''} ${isLoading ? 'opacity-30' : ''}`} />
        <span className={`text-sm font-medium ${isLoading ? 'opacity-30' : ''}`}>
          {isLoading ? 'Loading...' : isRTL ? 'RTL' : 'LTR'}
        </span>
        <RotateCw className={`h-3 w-3 transition-all duration-300 ${isLoading ? 'animate-spin opacity-30' : ''}`} />
      </button>
    </div>
  );
};

export default DirectionToggle; 