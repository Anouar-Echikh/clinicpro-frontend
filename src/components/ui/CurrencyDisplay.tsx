import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  variant?: 'default' | 'large' | 'small';
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  className,
  showSymbol = true,
  showCode = false,
  variant = 'default'
}) => {
  const { formatAmount, currentCurrency, currencyInfo } = useCurrency();

  const formattedAmount = formatAmount(amount);
  
  const baseClasses = cn(
    'font-medium',
    {
      'text-2xl': variant === 'large',
      'text-base': variant === 'default',
      'text-sm': variant === 'small',
    },
    className
  );

  if (!showSymbol && !showCode) {
    // Just show the number
    const numberOnly = currencyInfo ? amount.toFixed(currencyInfo.decimals) : amount.toString();
    return <span className={baseClasses}>{numberOnly}</span>;
  }

  if (showCode && !showSymbol) {
    // Show amount with currency code
    const numberPart = currencyInfo ? amount.toFixed(currencyInfo.decimals) : amount.toString();
    return (
      <span className={baseClasses}>
        {numberPart} {currentCurrency}
      </span>
    );
  }

  if (showSymbol && showCode) {
    // Show formatted amount with currency code
    return (
      <span className={baseClasses}>
        {formattedAmount} {currentCurrency}
      </span>
    );
  }

  // Default: show formatted amount with symbol
  return <span className={baseClasses}>{formattedAmount}</span>;
};

export default CurrencyDisplay; 