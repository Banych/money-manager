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
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface InterceptedModalProps {
  title: string | (() => string);
  description: string | (() => string);
  children: ReactNode; // Functions can't cross the RSC boundary; use context hook instead
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

const InterceptedModalContext = createContext<{ onClose: () => void } | null>(
  null
);

export function useInterceptedModal() {
  return useContext(InterceptedModalContext);
}

export default function InterceptedModal({
  title,
  description,
  children,
  onClose,
}: InterceptedModalProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(true);

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
        setOpen(false);
        onClose?.();
        router.back();
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
          <InterceptedModalContext.Provider value={{ onClose: handleClose }}>
            <div className="overflow-y-auto">{children}</div>
          </InterceptedModalContext.Provider>
        </DialogContent>
      </Dialog>
    </ModalErrorBoundary>
  );
}
