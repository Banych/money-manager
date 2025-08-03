'use client';

import AddAccountFormWrapper from '@/components/accounts/add-account-form-wrapper';
import InterceptedModal from '@/components/ui/intercepted-modal';

export const dynamic = 'force-static';

export default function InterceptedAddAccountPage() {
  return (
    <InterceptedModal
      title="Add Financial Account"
      description="Create a new account to track your finances."
      maxWidth="md"
    >
      {({ onClose }) => <AddAccountFormWrapper onClose={onClose} />}
    </InterceptedModal>
  );
}
