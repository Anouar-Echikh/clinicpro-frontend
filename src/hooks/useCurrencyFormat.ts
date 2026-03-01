import { useCurrency } from '@/contexts/CurrencyContext';

export const useCurrencyFormat = () => {
  const { formatAmount, currentCurrency, currencyInfo } = useCurrency();

  const formatCurrency = (amount: number): string => {
    return formatAmount(amount);
  };

  const formatCurrencyWithCode = (amount: number): string => {
    const formatted = formatAmount(amount);
    return `${formatted} ${currentCurrency}`;
  };

  const getCurrencySymbol = (): string => {
    return currencyInfo?.symbol || '$';
  };

  const formatNumber = (amount: number): string => {
    if (!currencyInfo) return amount.toString();
    return amount.toFixed(currencyInfo.decimals);
  };

  return {
    formatCurrency,
    formatCurrencyWithCode,
    getCurrencySymbol,
    formatNumber,
    currentCurrency,
    currencyInfo
  };
};

export default useCurrencyFormat; 