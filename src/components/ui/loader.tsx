import { cn } from '@/lib/utils';
import { ClassValue } from 'clsx';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

type LoaderProps = {
  className?: ClassValue;
  label?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export default function Loader({ className, label, size }: LoaderProps) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-10',
  };
  const sizeClass = size ? sizeClasses[size] : 'size-8';

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2
        className={cn('animate-spin', sizeClass)}
        aria-label="Loading"
      />
      {label && <span className="ml-3 text-lg">{label}</span>}
    </div>
  );
}
