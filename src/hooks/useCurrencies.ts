import { useQuery } from '@tanstack/react-query';
import { apiService, CurrencyInfo } from '@/services/api';

// Hook to fetch supported currencies
export const useCurrencies = () => {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async (): Promise<CurrencyInfo[]> => {
      return await apiService.getCurrencies();
    },
    staleTime: 60 * 60 * 1000, // 1 hour - currencies don't change often
    retry: 2,
  });
};

export default useCurrencies;
