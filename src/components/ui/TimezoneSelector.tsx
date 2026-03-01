import React, { useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useTimezone } from '@/contexts/TimezoneContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Get a friendly display label for a timezone (e.g. "Eastern (New York)")
 */
function getTimezoneLabel(tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      timeZoneName: 'long',
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart?.value || tz;
  } catch {
    return tz.replace(/_/g, ' ');
  }
}

interface TimezoneSelectorProps {
  variant?: 'default' | 'compact';
  showLabel?: boolean;
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  variant = 'default',
  showLabel = true,
}) => {
  const { currentTimezone, availableTimezones, setTimezone, loading } = useTimezone();
  const [isChanging, setIsChanging] = useState(false);

  const handleTimezoneChange = async (timezone: string) => {
    if (timezone === currentTimezone || isChanging) return;

    try {
      setIsChanging(true);
      await setTimezone(timezone);
    } catch (error) {
      console.error('Failed to change timezone:', error);
    } finally {
      setIsChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 animate-pulse" />
        {showLabel && <span className="text-sm text-muted-foreground">Loading...</span>}
      </div>
    );
  }

  const currentLabel = getTimezoneLabel(currentTimezone);

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
            <Globe className="h-3.5 w-3.5 mr-1" />
            <span className="truncate max-w-[120px]">{currentLabel}</span>
            <ChevronDown className="ml-1 h-3 w-3 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto w-64">
          {availableTimezones.map((tz) => (
            <DropdownMenuItem
              key={tz}
              onClick={() => handleTimezoneChange(tz)}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm truncate">{getTimezoneLabel(tz)}</span>
                <span className="text-xs text-muted-foreground truncate">{tz}</span>
              </div>
              {tz === currentTimezone && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
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
        <label className="text-sm font-medium text-gray-700">Timezone</label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between" disabled={isChanging}>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{currentLabel}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[300px] max-h-[300px] overflow-y-auto">
          {availableTimezones.map((tz) => (
            <DropdownMenuItem
              key={tz}
              onClick={() => handleTimezoneChange(tz)}
              className="flex items-center justify-between p-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{getTimezoneLabel(tz)}</span>
                <span className="text-sm text-muted-foreground">{tz}</span>
              </div>
              {tz === currentTimezone && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TimezoneSelector;
