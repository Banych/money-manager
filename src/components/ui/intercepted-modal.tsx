'use client';

import BackButton from '@/components/back-button';
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
            <BackButton label="Go Back" />
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
  onClose,
}: InterceptedModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
            try {
              router.back();
            } catch {
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

  if (!isMounted) return null;

  return (
    <ModalErrorBoundary>
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent>
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
