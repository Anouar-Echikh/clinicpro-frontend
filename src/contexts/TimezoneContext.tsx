import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { useAuth } from './AuthContext';
import { COMMON_TIMEZONES } from '@/utils/timezones';

interface TimezoneContextType {
  currentTimezone: string;
  availableTimezones: string[];
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  setTimezone: (timezone: string) => Promise<void>;
  loading: boolean;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

interface TimezoneProviderProps {
  children: ReactNode;
}

export const TimezoneProvider: React.FC<TimezoneProviderProps> = ({ children }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [currentTimezone, setCurrentTimezone] = useState<string>('America/New_York');
  const [availableTimezones] = useState<string[]>(COMMON_TIMEZONES);
  const [loading, setLoading] = useState(true);

  // Sync timezone when user changes
  useEffect(() => {
    if (isAuthenticated && user?.timezone) {
      setCurrentTimezone(user.timezone);
    } else if (isAuthenticated && user) {
      setCurrentTimezone(user.timezone || 'America/New_York');
    } else {
      setCurrentTimezone('America/New_York');
    }
    setLoading(false);
  }, [user?.timezone, isAuthenticated, user]);

  const formatDate = (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleDateString(undefined, {
      timeZone: currentTimezone,
      ...options,
    });
  };

  const formatDateTime = (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleString(undefined, {
      timeZone: currentTimezone,
      ...options,
    });
  };

  const setTimezone = async (timezone: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to change timezone');
    }

    try {
      setLoading(true);

      await apiService.updateProfile({
        timezone,
      });

      await refreshUser();

      setCurrentTimezone(timezone);
    } catch (error) {
      console.error('Error updating timezone:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TimezoneContext.Provider
      value={{
        currentTimezone,
        availableTimezones,
        formatDate,
        formatDateTime,
        setTimezone,
        loading,
      }}
    >
      {children}
    </TimezoneContext.Provider>
  );
};

export default TimezoneProvider;
