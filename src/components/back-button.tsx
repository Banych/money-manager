'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ComponentProps, ReactNode } from 'react';

type BackButtonProps = ComponentProps<typeof Button> & {
  label?: ReactNode;
};

const BackButton = ({
  label,
  className,
  variant,
  ...props
}: BackButtonProps) => {
  const { back } = useRouter();

  return (
    <Button
      {...props}
      aria-label="Close modal"
      variant={variant || 'ghost'}
      className={cn(
        'flex size-8 items-center justify-center gap-2 rounded-md p-0',
        label && 'w-auto',
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
