'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ClassValue } from 'clsx';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

type BackButtonProps = {
  label?: ReactNode;
  className?: ClassValue;
};

const BackButton = ({ label, className }: BackButtonProps) => {
  const { back } = useRouter();

  return (
    <Button
      aria-label="Close modal"
      variant="ghost"
      className={cn(
        'flex size-8 items-center justify-center gap-2 rounded-md p-0',
        className
      )}
      onClick={back}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
};

export default BackButton;
