import React, { useState } from 'react';
import { Check, ChevronDown, DollarSign } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface CurrencySelectorProps {
  variant?: 'default' | 'compact';
  showLabel?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  variant = 'default',
  showLabel = true
}) => {
  const { currentCurrency, currencyInfo, availableCurrencies, setCurrency, loading } = useCurrency();
  const [isChanging, setIsChanging] = useState(false);

  const handleCurrencyChange = async (currencyCode: string) => {
    if (currencyCode === currentCurrency || isChanging) return;

    try {
      setIsChanging(true);
      await setCurrency(currencyCode);
    } catch (error) {
      console.error('Failed to change currency:', error);
      toast({
        title: 'Failed to update currency',
        description: 'Please try again or contact support if the problem persists.',
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  };

  if (loading || !currencyInfo) {
    return (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 animate-pulse" />
        {showLabel && <span className="text-sm text-muted-foreground">Loading...</span>}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            disabled={isChanging}
          >
            <span className="font-medium">{currencyInfo.symbol}</span>
            <span className="ml-1 text-muted-foreground">{currentCurrency}</span>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {availableCurrencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => handleCurrencyChange(currency.code)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{currency.symbol}</span>
                <span className="text-sm">{currency.code}</span>
              </div>
              {currency.code === currentCurrency && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="text-sm font-medium text-gray-700">
          Base Currency
        </label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={isChanging}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>{currencyInfo.symbol} {currentCurrency}</span>
              <Badge variant="secondary" className="text-xs">
                {currencyInfo.name}
              </Badge>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[300px]">
          {availableCurrencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => handleCurrencyChange(currency.code)}
              className="flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium">{currency.symbol}</span>
                <div>
                  <div className="font-medium">{currency.code}</div>
                  <div className="text-sm text-muted-foreground">
                    {currency.name}
                  </div>
                </div>
              </div>
              {currency.code === currentCurrency && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CurrencySelector; 