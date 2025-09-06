'use client';

import AddAccountForm from '@/components/accounts/add-account-form';
import InterceptedModal from '@/components/ui/intercepted-modal';

export const dynamic = 'force-static';

export default function InterceptedAddAccountPage() {
  return (
    <InterceptedModal
      title="Add Financial Account"
      description="Create a new account to track your finances."
    >
      <AddAccountForm />
    </InterceptedModal>
  );
}
