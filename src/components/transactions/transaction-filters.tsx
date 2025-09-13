'use client';

import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { TransactionType } from '@/generated/prisma';
import { Search } from 'lucide-react';
import { useMemo } from 'react';

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  type: TransactionType | undefined;
  onTypeChange: (type: TransactionType | undefined) => void;
  category: string | undefined;
  onCategoryChange: (category: string | undefined) => void;
  fromDate: Date | undefined;
  onFromDateChange: (date: Date | undefined) => void;
  toDate: Date | undefined;
  onToDateChange: (date: Date | undefined) => void;
}

export default function TransactionFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  category,
  onCategoryChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}: TransactionFiltersProps) {
  const categoriesInTypes = useMemo(() => {
    return Object.entries(DEFAULT_CATEGORIES).reduce<
      { title: TransactionType; categories: string[] }[]
    >((acc, [key, value]) => {
      acc.push({ title: key as TransactionType, categories: value });
      return acc;
    }, []);
  }, []);

  const handleCategoryInTypeChange = (value: string) => {
    if (value.startsWith('all')) {
      if (value.startsWith('all-')) {
        const typePart = value.split('-')[1] as TransactionType;
        onTypeChange(typePart);
        onCategoryChange(undefined);
      } else {
        onTypeChange(undefined);
        onCategoryChange(undefined);
      }
    } else {
      onCategoryChange(value);
      const typeOfCategory = Object.entries(DEFAULT_CATEGORIES).find(
        ([_, cats]) => cats.includes(value)
      )?.[0] as TransactionType | undefined;
      if (typeOfCategory) {
        onTypeChange(typeOfCategory);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Categories in types filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Types&Categories
          </label>
          <Select
            value={category ? category : type ? `all-${type}` : 'all'}
            onValueChange={handleCategoryInTypeChange}
          >
            <SelectTrigger>
              {/* <SelectValue>{categoriesInTypeSelectTitle}</SelectValue> */}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types & Categories</SelectItem>
              {categoriesInTypes.map((typeGroup) => (
                <SelectGroup key={typeGroup.title}>
                  <SelectLabel>{typeGroup.title}</SelectLabel>
                  <SelectItem value={`all-${typeGroup.title}`}>
                    All {typeGroup.title}
                  </SelectItem>
                  {typeGroup.categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* From Date */}
        <div>
          <label className="mb-2 block text-sm font-medium">From Date</label>
          <DateTimePicker
            value={fromDate}
            onChange={onFromDateChange}
            maxDate={toDate}
          />
        </div>

        {/* To Date */}
        <div>
          <label className="mb-2 block text-sm font-medium">To Date</label>
          <DateTimePicker
            value={toDate}
            onChange={onToDateChange}
            minDate={fromDate}
          />
        </div>
      </div>
    </div>
  );
}
