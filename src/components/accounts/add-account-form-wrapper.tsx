'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AddAccountForm from './add-account-form';

interface AddAccountFormWrapperProps {
  onClose?: () => void;
}

export default function AddAccountFormWrapper({
  onClose,
}: AddAccountFormWrapperProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const handleSuccess = () => {
    // Close modal first if it's a modal context
    onClose?.();
    // Then navigate to accounts page
    router.push('/accounts');
  };

  const handleCancel = () => {
    // Close modal first if it's a modal context
    onClose?.();
    // Then go back
    router.back();
  };

  return (
    <AddAccountForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
