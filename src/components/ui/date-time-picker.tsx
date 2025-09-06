'use client';

import { isAfter, isBefore } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatDateTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /**
   * The minimum date that can be selected
   */
  minDate?: Date;
  /**
   * The maximum date that can be selected
   */
  maxDate?: Date;
}

export function DateTimePicker({
  value,
  onChange,
  onBlur,
  placeholder = 'MM/DD/YYYY hh:mm',
  disabled = false,
  className,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Helper function to check if an hour should be disabled
  const isHourDisabled = (hour: number): boolean => {
    if (!value) return false;

    const testDate = new Date(value);
    testDate.setHours(hour);
    testDate.setMinutes(value.getMinutes());

    if (minDate && isBefore(testDate, minDate)) return true;
    if (maxDate && isAfter(testDate, maxDate)) return true;

    return false;
  };

  // Helper function to check if a minute should be disabled
  const isMinuteDisabled = (minute: number): boolean => {
    if (!value) return false;

    const testDate = new Date(value);
    testDate.setMinutes(minute);

    if (minDate && isBefore(testDate, minDate)) return true;
    if (maxDate && isAfter(testDate, maxDate)) return true;

    return false;
  };

  // Create hidden dates array for Calendar
  const hiddenDates = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // If we have an existing value, preserve the time
      if (value) {
        const newDate = new Date(selectedDate);
        newDate.setHours(value.getHours());
        newDate.setMinutes(value.getMinutes());
        onChange?.(newDate);
      } else {
        onChange?.(selectedDate);
      }
    } else {
      onChange?.(undefined);
    }
  };

  const handleTimeChange = (type: 'hour' | 'minute', timeValue: string) => {
    if (value) {
      const newDate = new Date(value);
      if (type === 'hour') {
        newDate.setHours(parseInt(timeValue));
      } else if (type === 'minute') {
        newDate.setMinutes(parseInt(timeValue));
      }

      // Check if the new time violates min/max constraints
      if (minDate && isBefore(newDate, minDate)) {
        return; // Don't update if before min date
      }
      if (maxDate && isAfter(newDate, maxDate)) {
        return; // Don't update if after max date
      }

      onChange?.(newDate);
    } else {
      // If no date is selected, create a new date with today's date
      const newDate = new Date();
      if (type === 'hour') {
        newDate.setHours(parseInt(timeValue));
      } else if (type === 'minute') {
        newDate.setMinutes(parseInt(timeValue));
      }

      // Check constraints for new date too
      if (minDate && isBefore(newDate, minDate)) {
        return;
      }
      if (maxDate && isAfter(newDate, maxDate)) {
        return;
      }

      onChange?.(newDate);
    }
  };

  const handleIsOpenChange = (open: boolean) => {
    if (!disabled) {
      setIsOpen(open);
    }
    if (!open && onBlur) {
      onBlur();
    }
  };

  useEffect(() => {
    // Close popover when component unmounts (e.g., when dialog closes)
    return () => {
      setIsOpen(false);
    };
  }, []);

  useEffect(() => {
    // Close popover if disabled state changes
    if (disabled && isOpen) {
      setIsOpen(false);
    }
  }, [disabled, isOpen]);

  // Scroll to selected hour and minute when popover opens
  useEffect(() => {
    if (isOpen && value) {
      // Use setTimeout to ensure the DOM is rendered before scrolling
      setTimeout(() => {
        const selectedHour = value.getHours();
        const selectedMinute = value.getMinutes();

        // Scroll to selected hour
        if (hourScrollRef.current) {
          // Hours are reversed (23 to 0), so we need to calculate the reverse position
          const reverseHourPosition = 24 - selectedHour;
          const hourButton = hourScrollRef.current.querySelector(
            `button:nth-child(${reverseHourPosition})`
          ) as HTMLButtonElement;
          if (hourButton) {
            hourButton.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }

        // Scroll to selected minute
        if (minuteScrollRef.current) {
          const minuteButton = minuteScrollRef.current.querySelector(
            `button:nth-child(${selectedMinute + 1})`
          ) as HTMLButtonElement;
          if (minuteButton) {
            minuteButton.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }
      }, 100);
    }
  }, [isOpen, value]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={handleIsOpenChange}
      modal={isOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDateTime(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[100] w-auto p-0"
        onOpenAutoFocus={(event) => {
          // Prevent the popover from automatically focusing when it opens
          // This prevents focus conflicts with the parent dialog
          event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          // Prevent the popover from trying to restore focus when it closes
          // Let the parent dialog handle focus restoration
          event.preventDefault();
        }}
      >
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={disabled}
            hidden={hiddenDates.length > 0 ? hiddenDates : undefined}
          />
          <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
            <ScrollArea className="w-64 sm:w-auto">
              <div
                ref={hourScrollRef}
                className="flex p-2 sm:flex-col"
              >
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      value && value.getHours() === hour ? 'default' : 'ghost'
                    }
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() => handleTimeChange('hour', hour.toString())}
                    disabled={disabled || isHourDisabled(hour)}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar
                orientation="horizontal"
                className="sm:hidden"
              />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div
                ref={minuteScrollRef}
                className="flex p-2 sm:flex-col"
              >
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      value && value.getMinutes() === minute
                        ? 'default'
                        : 'ghost'
                    }
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() =>
                      handleTimeChange('minute', minute.toString())
                    }
                    disabled={disabled || isMinuteDisabled(minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar
                orientation="horizontal"
                className="sm:hidden"
              />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
