'use client';

import { useRouter } from 'next/navigation';
import AddAccountForm from './add-account-form';

interface AddAccountFormWrapperProps {
  onClose?: () => void;
}

export default function AddAccountFormWrapper({
  onClose,
}: AddAccountFormWrapperProps) {
  const router = useRouter();

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
