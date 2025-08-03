'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useState } from 'react';

interface InterceptedModalProps {
  title: string | (() => string);
  description: string | (() => string);
  children: ReactNode | ((props: { onClose: () => void }) => ReactNode);
  className?: string;
  onClose?: () => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ModalErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function ModalErrorBoundary({ children, fallback }: ModalErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Log error for debugging
      if (typeof window !== 'undefined' && window.console) {
        window.console.error('Modal Error:', event.error);
      }
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="mb-2 text-red-600">
              Something went wrong with the modal.
            </p>
            <button
              onClick={() => {
                setHasError(false);
                window.history.back();
              }}
              className="text-blue-600 underline"
            >
              Go back
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

export default function InterceptedModal({
  title,
  description,
  children,
  className,
  onClose,
  maxWidth = 'sm',
}: InterceptedModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        try {
          setOpen(false);
          onClose?.();

          // Add a small delay before navigation to ensure state updates
          setTimeout(() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }, 100);
        } catch (error) {
          // Log error for debugging
          if (typeof window !== 'undefined' && window.console) {
            window.console.error('Error closing modal:', error);
          }
          // Fallback navigation
          window.location.href = '/';
        }
      }
    },
    [router, onClose]
  );

  const handleClose = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const resolvedTitle = typeof title === 'function' ? title() : title;
  const resolvedDescription =
    typeof description === 'function' ? description() : description;

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
  };

  return (
    <ModalErrorBoundary>
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent
          className={`mx-4 max-h-full max-w-sm overflow-y-auto ${maxWidthClasses[maxWidth]} md:max-h-[90vh] ${className || ''}`}
        >
          <DialogHeader className="pb-4 text-left">
            <DialogTitle className="text-lg sm:text-xl">
              {resolvedTitle}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {resolvedDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto">
            {typeof children === 'function'
              ? children({ onClose: handleClose })
              : children}
          </div>
        </DialogContent>
      </Dialog>
    </ModalErrorBoundary>
  );
}
