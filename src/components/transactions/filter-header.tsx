'use client';

import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

interface FilterHeaderProps {
  hasActiveFilters: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

export default function FilterHeader({
  hasActiveFilters,
  showFilters,
  onToggleFilters,
  onClearFilters,
}: FilterHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Filter className="h-5 w-5" />
        Filters
      </CardTitle>
      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>
      </div>
    </div>
  );
}
