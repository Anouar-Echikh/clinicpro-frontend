import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, CurrencyInfo } from '@/services/api';
import { useAuth } from './AuthContext';

interface CurrencyContextType {
  currentCurrency: string;
  currencyInfo: CurrencyInfo | null;
  availableCurrencies: CurrencyInfo[];
  formatAmount: (amount: number) => string;
  setCurrency: (currencyCode: string) => Promise<void>;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<CurrencyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Load available currencies
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencies = await apiService.getCurrencies();
        setAvailableCurrencies(currencies);
      } catch (error) {
        console.error('Error loading currencies:', error);
        // Set default currencies if API fails
        setAvailableCurrencies([
          {
            code: 'USD',
            name: 'US Dollar',
            symbol: '$',
            position: 'before',
            decimals: 2
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCurrencies();
  }, []);

  // Update currency when user changes or currencies are loaded
  useEffect(() => {
    if (isAuthenticated && user?.baseCurrency && availableCurrencies.length > 0) {
      const userCurrency = user.baseCurrency;
      const currency = availableCurrencies.find(c => c.code === userCurrency);
      
      if (currency) {
        setCurrentCurrency(userCurrency);
        setCurrencyInfo(currency);
      } else {
        // Fallback to USD if user's currency is not available
        const usdCurrency = availableCurrencies.find(c => c.code === 'USD');
        if (usdCurrency) {
          setCurrentCurrency('USD');
          setCurrencyInfo(usdCurrency);
        }
      }
    } else if (!isAuthenticated) {
      // Default to USD for non-authenticated users
      const usdCurrency = availableCurrencies.find(c => c.code === 'USD');
      if (usdCurrency) {
        setCurrentCurrency('USD');
        setCurrencyInfo(usdCurrency);
      }
    }
  }, [user?.baseCurrency, isAuthenticated, availableCurrencies]);

  const formatAmount = (amount: number): string => {
    if (!currencyInfo) return amount.toString();
    
    const formattedAmount = amount.toFixed(currencyInfo.decimals);
    
    if (currencyInfo.position === 'before') {
      return `${currencyInfo.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${currencyInfo.symbol}`;
    }
  };

  const setCurrency = async (currencyCode: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to change currency');
    }

    try {
      setLoading(true);
      
      // Update user profile with new currency
      await apiService.updateProfile({
        base_currency: currencyCode
      });

      // Refresh user data in AuthContext to get the updated currency
      await refreshUser();

      // Update local state
      const newCurrency = availableCurrencies.find(c => c.code === currencyCode);
      if (newCurrency) {
        setCurrentCurrency(currencyCode);
        setCurrencyInfo(newCurrency);
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        currencyInfo,
        availableCurrencies,
        formatAmount,
        setCurrency,
        loading
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyProvider; 